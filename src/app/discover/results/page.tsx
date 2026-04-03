"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExtractedSkill, CareerMatch } from "@/lib/types";
import { getCategoryColour } from "@/lib/skills/taxonomy";
import type { SkillCategory } from "@/data/skills-taxonomy";
import {
  getCourseRecommendations,
  getCvBuilderRecommendation,
  getWellbeingRecommendation,
} from "@/lib/affiliate/links";

interface Assessment {
  id: string;
  skills: ExtractedSkill[];
  matches: CareerMatch[];
  inputText: string;
}

function MatchScoreRing({ percentage }: { percentage: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const colour =
    percentage >= 70
      ? "#22c55e"
      : percentage >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color: colour }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function SkillTag({
  skill,
}: {
  skill: ExtractedSkill;
}) {
  const colourClass = getCategoryColour(skill.category as SkillCategory);
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colourClass}`}
      style={{ opacity: 0.5 + skill.confidence * 0.5 }}
    >
      {skill.name}
    </span>
  );
}

function CareerMatchCard({
  match,
  rank,
}: {
  match: CareerMatch;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(rank === 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center gap-6 text-left"
      >
        <MatchScoreRing percentage={match.matchPercentage} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {rank === 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Top Match
              </span>
            )}
            {match.demandLevel === "high" && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                High Demand
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {match.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {match.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>
              {match.salaryRange?.median
                ? `£${(match.salaryRange.median / 1000).toFixed(0)}k median`
                : ""}
            </span>
            <span>
              {match.transitionDifficulty === "easy"
                ? "Easy transition"
                : match.transitionDifficulty === "moderate"
                  ? "Some upskilling needed"
                  : "Significant development needed"}
            </span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-50 pt-4">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Matched skills */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                Skills You Have ({match.matchedSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {match.matchedSkills?.map((s) => (
                  <span
                    key={s.skillId}
                    className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Gap skills */}
            <div>
              <h4 className="text-sm font-semibold text-amber-700 mb-2">
                Skills to Develop ({match.gapSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {match.gapSkills?.map((s) => (
                  <span
                    key={s.skillId}
                    className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                  >
                    {s.name}
                  </span>
                ))}
                {(!match.gapSkills || match.gapSkills.length === 0) && (
                  <span className="text-sm text-gray-400">
                    No significant gaps identified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Salary range */}
          {match.salaryRange && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-1">
                UK Salary Range
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">
                  £{(match.salaryRange.min / 1000).toFixed(0)}k
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute h-2 bg-indigo-500 rounded-full"
                    style={{
                      left: "0%",
                      width: `${((match.salaryRange.median - match.salaryRange.min) / (match.salaryRange.max - match.salaryRange.min)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-600">
                  £{(match.salaryRange.max / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <Link
              href={`/jobs?q=${encodeURIComponent(match.title)}`}
              className="flex-1 text-center bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              See Matching Jobs
            </Link>
            <Link
              href="/career-gps"
              className="flex-1 text-center border border-indigo-200 text-indigo-700 font-medium py-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
            >
              View Career GPS
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("assessment");
    if (!stored) {
      router.push("/discover");
      return;
    }
    try {
      setAssessment(JSON.parse(stored));
    } catch {
      router.push("/discover");
    }
  }, [router]);

  if (!assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading your results...</p>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = assessment.skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "hard";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, ExtractedSkill[]>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Analysis Complete
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Your Career Matches
        </h1>
        <p className="mt-3 text-gray-500">
          We found{" "}
          <span className="font-semibold text-indigo-600">
            {assessment.skills.length} skills
          </span>{" "}
          and{" "}
          <span className="font-semibold text-indigo-600">
            {assessment.matches.length} career matches
          </span>{" "}
          for you.
        </p>
      </div>

      {/* Skills Profile */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Skills Profile
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category === "hard"
                  ? "Technical & Hard Skills"
                  : category === "soft"
                    ? "Soft Skills"
                    : category === "knowledge"
                      ? "Knowledge & Expertise"
                      : "Life Experience Skills"}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills
                  .sort((a, b) => b.confidence - a.confidence)
                  .map((skill) => (
                    <SkillTag key={skill.skillId} skill={skill} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career Matches */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Career Matches
        </h2>
        <div className="space-y-4">
          {assessment.matches.map((match, i) => (
            <CareerMatchCard
              key={match.occupationId}
              match={match}
              rank={i}
            />
          ))}
        </div>
      </section>

      {/* Close Your Skills Gaps - Affiliate Recommendations */}
      {assessment.matches[0]?.gapSkills && assessment.matches[0].gapSkills.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Close Your Skills Gaps
          </h2>
          <div className="space-y-4">
            {assessment.matches[0].gapSkills.slice(0, 3).map((gap) => {
              const courses = getCourseRecommendations(gap.name);
              return (
                <div key={gap.skillId} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="text-sm font-medium text-amber-700 mb-3">
                    Learn: {gap.name}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {courses.map((course) => (
                      <a
                        key={course.provider}
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">{course.provider}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{course.description}</div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tools & Resources - Affiliate */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tools to Help Your Transition
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {(() => {
            const cvRec = getCvBuilderRecommendation(assessment.matches[0]?.title);
            return (
              <a
                href={cvRec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="text-sm font-semibold text-indigo-600 mb-1">{cvRec.name}</div>
                <div className="text-sm text-gray-500">{cvRec.description}</div>
              </a>
            );
          })()}
          {(() => {
            const wellbeing = getWellbeingRecommendation();
            return (
              <a
                href={wellbeing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="text-sm font-semibold text-green-600 mb-1">{wellbeing.name}</div>
                <div className="text-sm text-gray-500">{wellbeing.description}</div>
              </a>
            );
          })()}
        </div>
      </section>

      {/* Save Results CTA */}
      <section className="mb-12 bg-indigo-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Save your results</h3>
        <p className="text-sm text-gray-500 mb-4">Create a free account to save your assessments and track your career transition progress.</p>
        <div className="flex justify-center gap-3">
          <Link href="/signup" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Create Free Account
          </Link>
          <Link href="/login" className="border border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-white transition-colors text-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/discover"
          className="flex-1 text-center border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Try Another Assessment
        </Link>
        <Link
          href="/jobs"
          className="flex-1 text-center bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Browse All Jobs
        </Link>
      </div>
    </div>
  );
}
