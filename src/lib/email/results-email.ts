import { Resend } from "resend";

// Server-only. Sends the results email straight from /api/assess.
// This used to be a public POST route (/api/send-results) that emailed whatever
// HTML and address the caller supplied, from a verified domain on the shared
// Resend account, so it has to stay unreachable from the browser.

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY.replace(/\\n$/, "").trim())
  : null;

interface CareerMatchEmail {
  title: string;
  matchPercentage: number;
  salaryRange?: { min: number; max: number; median: number };
  matchedSkills: { name: string }[];
  gapSkills: { name: string }[];
  transitionDifficulty: string;
}

interface SkillEmail {
  name: string;
  category: string;
  confidence: number;
}

// Skill names and titles come from model output built on the user's CV text,
// so every interpolated string is escaped.
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pct(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

function buildEmailHtml(skills: SkillEmail[], matches: CareerMatchEmail[]): string {
  const skillTags = [...skills]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20)
    .map(
      (s) =>
        `<span style="display:inline-block;padding:4px 12px;margin:2px;border-radius:20px;font-size:13px;background:${
          s.category === "hard" || s.category === "knowledge"
            ? "#e0e7ff;color:#4338ca"
            : s.category === "life"
              ? "#fef3c7;color:#92400e"
              : "#d1fae5;color:#065f46"
        }">${esc(s.name)}</span>`
    )
    .join("");

  const matchCards = matches
    .slice(0, 5)
    .map((m) => {
      const p = pct(m.matchPercentage);
      const colour = p >= 70 ? "#22c55e" : p >= 50 ? "#f59e0b" : "#ef4444";
      const median = Number(m.salaryRange?.median);
      const matched = Array.isArray(m.matchedSkills) ? m.matchedSkills : [];
      const gaps = Array.isArray(m.gapSkills) ? m.gapSkills : [];
      return `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="width:56px;height:56px;border-radius:50%;border:4px solid ${colour};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${colour}">
            ${p}%
          </div>
          <div>
            <div style="font-size:18px;font-weight:600;color:#111827;">${esc(m.title)}</div>
            <div style="font-size:13px;color:#6b7280;">
              ${Number.isFinite(median) && median > 0 ? `£${Math.round(median / 1000)}k median salary` : ""}
              ${m.transitionDifficulty === "easy" ? " · Easy transition" : m.transitionDifficulty === "moderate" ? " · Some upskilling needed" : " · Significant development needed"}
            </div>
          </div>
        </div>
        ${
          matched.length > 0
            ? `<div style="margin-bottom:8px;"><span style="font-size:12px;font-weight:600;color:#059669;">Skills you have:</span> <span style="font-size:12px;color:#6b7280;">${matched.map((s) => esc(s.name)).join(", ")}</span></div>`
            : ""
        }
        ${
          gaps.length > 0
            ? `<div><span style="font-size:12px;font-weight:600;color:#d97706;">Skills to develop:</span> <span style="font-size:12px;color:#6b7280;">${gaps.map((s) => esc(s.name)).join(", ")}</span></div>`
            : ""
        }
      </div>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f9fafb;">
      <div style="max-width:600px;margin:0 auto;padding:32px 20px;">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:24px;font-weight:700;color:#111827;">
            Match<span style="color:#4f46e5;">My</span>Skills
          </div>
          <div style="font-size:14px;color:#9ca3af;margin-top:4px;">AI-Assisted. Human-Led.</div>
        </div>

        <!-- Intro -->
        <div style="background:white;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;">
          <h1 style="font-size:22px;color:#111827;margin:0 0 8px 0;">Your Career Match Results</h1>
          <p style="font-size:14px;color:#6b7280;margin:0;">
            We found <strong style="color:#4f46e5;">${skills.length} skills</strong> and
            <strong style="color:#4f46e5;">${matches.length} career matches</strong> based on your experience.
          </p>
        </div>

        <!-- Skills -->
        <div style="background:white;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #e5e7eb;">
          <h2 style="font-size:16px;color:#111827;margin:0 0 12px 0;">Your Skills Profile</h2>
          <div>${skillTags}</div>
        </div>

        <!-- Career Matches -->
        <div style="margin-bottom:24px;">
          <h2 style="font-size:16px;color:#111827;margin:0 0 16px 0;">Your Top Career Matches</h2>
          ${matchCards}
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:32px;">
          <a href="https://matchmyskillset.com/discover" style="display:inline-block;background:#4f46e5;color:white;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:16px;">
            View Full Results &amp; Find Jobs
          </a>
          <p style="font-size:12px;color:#9ca3af;margin-top:12px;">
            Browse thousands of matching UK jobs on our platform.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:20px;">
          <p style="font-size:12px;color:#9ca3af;margin:0;">
            MatchMySkillset · AI-Assisted Career Matching<br>
            <a href="https://matchmyskillset.com/privacy" style="color:#9ca3af;">Privacy Policy</a> ·
            <a href="https://matchmyskillset.com/terms" style="color:#9ca3af;">Terms</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendResultsEmail(email: string, skills: unknown, matches: unknown): Promise<void> {
  if (!resend) {
    console.log("[results-email] Resend not configured, skipping");
    return;
  }
  if (!Array.isArray(skills) || !Array.isArray(matches) || matches.length === 0) return;

  const skillList = skills as SkillEmail[];
  const matchList = matches as CareerMatchEmail[];
  // Plain-text subject: strip control characters so a title can't inject headers.
  const topMatch = String(matchList[0]?.title || "your career matches").replace(/[\r\n\t]+/g, " ").slice(0, 80);

  try {
    const { error } = await resend.emails.send({
      from: "MatchMySkills <results@matchmyskillset.com>",
      to: email,
      subject: `Your career matches: ${topMatch} (${pct(matchList[0]?.matchPercentage)}% match) and ${matchList.length - 1} more`,
      html: buildEmailHtml(skillList, matchList),
    });
    if (error) console.error("[results-email] Resend error:", error);
  } catch (err) {
    console.error("[results-email] Error:", err);
  }
}
