"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ExtractedSkill, CareerMatch } from "@/lib/types";

interface SavedAssessment {
  id: string;
  skills: ExtractedSkill[];
  matches: CareerMatch[];
  inputText: string;
  savedAt: string;
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);

  useEffect(() => {
    // Load saved assessments from localStorage
    const saved = localStorage.getItem("savedAssessments");
    if (saved) {
      try {
        setAssessments(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Your Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        Track your career discovery journey.
      </p>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link
          href="/discover"
          className="bg-indigo-50 rounded-xl p-5 hover:bg-indigo-100 transition-colors"
        >
          <div className="text-indigo-600 font-semibold mb-1">
            New Assessment
          </div>
          <p className="text-sm text-gray-500">
            Analyse your skills and discover new career matches.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="bg-green-50 rounded-xl p-5 hover:bg-green-100 transition-colors"
        >
          <div className="text-green-600 font-semibold mb-1">Browse Jobs</div>
          <p className="text-sm text-gray-500">
            Search thousands of UK jobs across multiple boards.
          </p>
        </Link>
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="text-gray-600 font-semibold mb-1">
            Save Your Results
          </div>
          <p className="text-sm text-gray-400">
            Create an account to save assessments and track your progress. Coming
            soon.
          </p>
        </div>
      </div>

      {/* Assessment history */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Assessments
      </h2>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-700 mb-2">
            No assessments yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Run your first skills assessment to discover career paths you never
            considered.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Discover My Careers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-400">
                    {new Date(assessment.savedAt).toLocaleDateString("en-GB")}
                  </div>
                  <div className="font-medium text-gray-900 mt-1">
                    {assessment.skills.length} skills extracted,{" "}
                    {assessment.matches.length} career matches
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Top match:{" "}
                    {assessment.matches[0]?.title || "Unknown"} (
                    {assessment.matches[0]?.matchPercentage || 0}%)
                  </div>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.setItem(
                      "assessment",
                      JSON.stringify(assessment)
                    );
                    window.location.href = `/discover/results?id=${assessment.id}`;
                  }}
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                >
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips section */}
      <div className="mt-10 bg-amber-50 rounded-xl p-6 border border-amber-100">
        <h3 className="font-semibold text-amber-800 mb-3">
          Tips for Better Results
        </h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>
            Include ALL experience: paid work, volunteering, parenting, caring,
            hobbies, and side projects.
          </li>
          <li>
            Be specific about responsibilities: &quot;managed a team of 5&quot;
            is better than &quot;team player.&quot;
          </li>
          <li>
            Mention achievements with numbers: budgets managed, people led,
            projects delivered.
          </li>
          <li>
            Do not worry about formatting. Our AI understands plain English.
          </li>
        </ul>
      </div>
    </div>
  );
}
