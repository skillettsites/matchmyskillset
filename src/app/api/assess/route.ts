import { NextRequest, NextResponse } from "next/server";
import { extractSkillsAndMatch } from "@/lib/apis/claude";
import { matchSkillsToOccupations } from "@/lib/skills/matcher";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// Simple in-memory rate limiting (per IP, 5 per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

// Simple in-memory cache for assessments
const assessmentCache = new Map<
  string,
  { id: string; skills: unknown; matches: unknown }
>();

export async function POST(request: NextRequest) {
  try {
    const { text, email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide your experience description." },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Please provide more detail about your experience (at least 50 characters).",
        },
        { status: 400 }
      );
    }

    if (trimmedText.length > 10000) {
      return NextResponse.json(
        { error: "Please keep your description under 10,000 characters." },
        { status: 400 }
      );
    }

    // Rate limit check (by email to prevent spam)
    const rateLimitKey = email.trim().toLowerCase();

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          error:
            "You have reached the assessment limit. Please try again in an hour.",
        },
        { status: 429 }
      );
    }

    // Check cache
    const inputHash = crypto
      .createHash("sha256")
      .update(trimmedText.toLowerCase())
      .digest("hex");

    const cached = assessmentCache.get(inputHash);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Check if Anthropic API key is configured - use demo mode if not
    if (!process.env.ANTHROPIC_API_KEY) {
      const demoId = crypto.randomUUID();
      const demoResult = getDemoResult(demoId, inputHash);
      assessmentCache.set(inputHash, demoResult);
      sendResultsEmail(email, demoResult.skills, demoResult.matches);
      saveToSupabase(email, inputHash, trimmedText, demoResult.skills, demoResult.matches);
      return NextResponse.json(demoResult);
    }

    // Call Claude API for skills extraction
    const claudeResult = await extractSkillsAndMatch(trimmedText);

    // Run our own matcher as well (to cross-validate and add scores)
    const matcherResults = matchSkillsToOccupations(
      claudeResult.extractedSkills,
      10
    );

    // Merge: use Claude's matches but cross-reference with our matcher scores
    // If our matcher found matches Claude missed, add them
    const claudeMatchIds = new Set(
      claudeResult.careerMatches.map((m) => m.occupationId)
    );

    const mergedMatches = [...claudeResult.careerMatches];
    for (const matcherResult of matcherResults) {
      if (!claudeMatchIds.has(matcherResult.occupationId)) {
        mergedMatches.push(matcherResult);
      }
    }

    // Sort by match percentage
    mergedMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Take top 10
    const topMatches = mergedMatches.slice(0, 10);

    const assessmentId = crypto.randomUUID();

    const result = {
      id: assessmentId,
      inputHash,
      skills: claudeResult.extractedSkills,
      matches: topMatches,
    };

    // Cache the result
    assessmentCache.set(inputHash, result);

    sendResultsEmail(email, result.skills, result.matches);
    saveToSupabase(email, inputHash, trimmedText, result.skills, result.matches);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[assess] Error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong analysing your skills. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Save assessment + email lead to Supabase (fire-and-forget)
function saveToSupabase(email: string, inputHash: string, inputText: string, skills: unknown, matches: unknown) {
  try {
    const supabase = createAdminClient();

    // Save full assessment including CV text (no truncation)
    supabase
      .from("mms_skill_assessments")
      .insert({
        email,
        input_hash: inputHash,
        input_text: inputText,
        extracted_skills: skills,
        career_matches: matches,
      })
      .then(({ error }) => {
        if (error) console.error("[assess] Supabase assessment save error:", error.message);
      });

    // Save/update email lead with CV, skills summary, and matches for Fred
    const matchArr = matches as Array<{ title?: string; matchPercentage?: number }>;
    const skillArr = skills as Array<{ name?: string; category?: string; confidence?: number }>;

    // Build skills summary string for quick scanning
    const skillsSummary = skillArr
      ?.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 15)
      .map((s) => s.name)
      .join(", ") || "";

    // Top 5 matches for quick view
    const top5 = matchArr?.slice(0, 5).map((m) => ({
      title: m.title,
      match: m.matchPercentage,
    })) || [];

    supabase
      .from("mms_email_leads")
      .upsert(
        {
          email,
          cv_text: inputText,
          skills_summary: skillsSummary,
          top_match: matchArr?.[0]?.title || null,
          match_percentage: matchArr?.[0]?.matchPercentage || null,
          skills_count: skillArr?.length || 0,
          top_5_matches: top5,
          source: "discover",
        },
        { onConflict: "email" }
      )
      .then(({ error }) => {
        if (error) console.error("[assess] Supabase lead save error:", error.message);
      });

    // Log search
    supabase
      .from("mms_search_logs")
      .insert({
        search_type: "assessment",
        query_text: inputText.slice(0, 200),
        results_count: Array.isArray(matches) ? (matches as unknown[]).length : 0,
        email,
      })
      .then(({ error }) => {
        if (error) console.error("[assess] Supabase log error:", error.message);
      });
  } catch (err) {
    console.error("[assess] Supabase save failed:", err);
  }
}

// Fire-and-forget email with results
function sendResultsEmail(email: string, skills: unknown, matches: unknown) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003").trim();
  fetch(`${baseUrl}/api/send-results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, skills, matches }),
  }).catch((err) => {
    console.error("[assess] Email send failed:", err);
  });
}

// Demo result when API key not configured (for testing)
function getDemoResult(id: string, inputHash: string) {
  return {
    id,
    inputHash,
    skills: [
      { skillId: "s002", name: "Verbal Communication", confidence: 0.95, category: "soft", source: "teaching English and Drama" },
      { skillId: "s041", name: "Team Leadership", confidence: 0.9, category: "soft", source: "managed a department of 5" },
      { skillId: "s161", name: "Training Delivery", confidence: 0.9, category: "hard", source: "led staff training sessions" },
      { skillId: "s055", name: "Mentoring", confidence: 0.85, category: "soft", source: "mentored NQTs" },
      { skillId: "s156", name: "Event Planning", confidence: 0.85, category: "hard", source: "ran the school play, organised parent evenings" },
      { skillId: "s048", name: "Stakeholder Management", confidence: 0.8, category: "soft", source: "organised parent evenings" },
      { skillId: "s157", name: "Curriculum Design", confidence: 0.8, category: "hard", source: "teaching English and Drama" },
      { skillId: "s001", name: "Written Communication", confidence: 0.8, category: "soft", source: "teaching English" },
      { skillId: "s007", name: "Conflict Resolution", confidence: 0.75, category: "soft", source: "behaviour management" },
      { skillId: "s160", name: "Teaching", confidence: 0.95, category: "hard", source: "secondary school teacher for 8 years" },
      { skillId: "s040", name: "Project Management", confidence: 0.7, category: "hard", source: "managed department, school play" },
      { skillId: "s050", name: "Empathy", confidence: 0.85, category: "life", source: "teaching and mentoring" },
      { skillId: "s053", name: "Time Management", confidence: 0.8, category: "soft", source: "managing teaching workload" },
      { skillId: "s052", name: "Adaptability", confidence: 0.75, category: "soft", source: "8 years across subjects" },
    ],
    matches: [
      {
        occupationId: "uk-3563", title: "Learning and Development Manager", description: "Your teaching, training delivery, and curriculum design skills transfer directly to corporate L&D. This is one of the most natural transitions for experienced teachers.",
        matchPercentage: 87, matchedSkills: [
          { skillId: "s161", name: "Training Delivery", importance: 5 },
          { skillId: "s157", name: "Curriculum Design", importance: 5 },
          { skillId: "s055", name: "Mentoring", importance: 4 },
          { skillId: "s002", name: "Verbal Communication", importance: 4 },
        ],
        gapSkills: [
          { skillId: "s020", name: "Data Analysis", importance: 3 },
        ],
        salaryRange: { min: 35000, max: 60000, median: 45000 }, demandLevel: "medium", transitionDifficulty: "easy",
      },
      {
        occupationId: "uk-2472", title: "UX Researcher", description: "Your empathy, interviewing skills, and ability to understand diverse audiences make you a strong candidate for UX Research. Teachers are excellent at understanding user needs.",
        matchPercentage: 74, matchedSkills: [
          { skillId: "s050", name: "Empathy", importance: 5 },
          { skillId: "s002", name: "Verbal Communication", importance: 3 },
          { skillId: "s001", name: "Written Communication", importance: 4 },
        ],
        gapSkills: [
          { skillId: "s113", name: "UX Design", importance: 5 },
          { skillId: "s020", name: "Data Analysis", importance: 4 },
        ],
        salaryRange: { min: 30000, max: 60000, median: 42000 }, demandLevel: "high", transitionDifficulty: "moderate",
      },
      {
        occupationId: "uk-3545", title: "Customer Success Manager", description: "Your stakeholder management, communication skills, and ability to build relationships with diverse groups translates perfectly to customer success.",
        matchPercentage: 72, matchedSkills: [
          { skillId: "s050", name: "Empathy", importance: 5 },
          { skillId: "s002", name: "Verbal Communication", importance: 4 },
          { skillId: "s048", name: "Stakeholder Management", importance: 3 },
        ],
        gapSkills: [
          { skillId: "s006", name: "Client Relationship Management", importance: 5 },
          { skillId: "s020", name: "Data Analysis", importance: 3 },
        ],
        salaryRange: { min: 30000, max: 60000, median: 40000 }, demandLevel: "high", transitionDifficulty: "moderate",
      },
      {
        occupationId: "uk-2312", title: "Instructional Designer", description: "Your curriculum design and teaching experience are the core skills for instructional design. You already think about how people learn.",
        matchPercentage: 82, matchedSkills: [
          { skillId: "s157", name: "Curriculum Design", importance: 5 },
          { skillId: "s001", name: "Written Communication", importance: 4 },
          { skillId: "s160", name: "Teaching", importance: 3 },
        ],
        gapSkills: [
          { skillId: "s113", name: "UX Design", importance: 3 },
          { skillId: "s152", name: "Video Production", importance: 3 },
        ],
        salaryRange: { min: 28000, max: 50000, median: 38000 }, demandLevel: "medium", transitionDifficulty: "easy",
      },
      {
        occupationId: "uk-2423", title: "Product Manager", description: "Your project management, stakeholder communication, and ability to synthesise complex information for diverse audiences are key product management skills.",
        matchPercentage: 62, matchedSkills: [
          { skillId: "s048", name: "Stakeholder Management", importance: 5 },
          { skillId: "s002", name: "Verbal Communication", importance: 4 },
          { skillId: "s040", name: "Project Management", importance: 3 },
        ],
        gapSkills: [
          { skillId: "s020", name: "Data Analysis", importance: 4 },
          { skillId: "s042", name: "Strategic Planning", importance: 5 },
        ],
        salaryRange: { min: 40000, max: 85000, median: 60000 }, demandLevel: "high", transitionDifficulty: "hard",
      },
      {
        occupationId: "uk-2471", title: "Content Strategist", description: "Your writing skills, storytelling ability from Drama, and understanding of how to engage an audience make you well-suited for content strategy.",
        matchPercentage: 68, matchedSkills: [
          { skillId: "s001", name: "Written Communication", importance: 5 },
          { skillId: "s157", name: "Curriculum Design (related)", importance: 4 },
          { skillId: "s002", name: "Verbal Communication", importance: 3 },
        ],
        gapSkills: [
          { skillId: "s111", name: "Digital Marketing", importance: 3 },
          { skillId: "s112", name: "Social Media Management", importance: 3 },
        ],
        salaryRange: { min: 28000, max: 55000, median: 38000 }, demandLevel: "medium", transitionDifficulty: "moderate",
      },
    ],
  };
}
