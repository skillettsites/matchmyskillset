"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CareerMatch } from "@/lib/types";
import {
  getCourseRecommendations,
  getCvBuilderRecommendation,
} from "@/lib/affiliate/links";

interface Route {
  type: "express" | "scenic" | "wildcard";
  label: string;
  icon: string;
  colour: string;
  bgColour: string;
  timeline: string;
  description: string;
  steps: { title: string; duration: string; detail: string; type: "learn" | "do" | "apply" }[];
  salaryAtEnd: string;
  riskLevel: string;
}

function buildRoutes(match: CareerMatch): Route[] {
  const gapCount = match.gapSkills?.length || 0;
  const gapNames = (match.gapSkills || []).map((s) => s.name);

  return [
    {
      type: "express",
      label: "Express Route",
      icon: "🚀",
      colour: "text-red-600",
      bgColour: "bg-red-50 border-red-200",
      timeline: gapCount <= 1 ? "4-8 weeks" : gapCount <= 3 ? "2-4 months" : "4-6 months",
      description: "Fastest path. Intensive upskilling, then apply directly. Higher risk, higher reward.",
      riskLevel: "Higher risk",
      salaryAtEnd: `£${Math.round((match.salaryRange?.median || 35000) / 1000)}k`,
      steps: [
        {
          title: "Intensive skills bootcamp",
          duration: gapCount <= 1 ? "2 weeks" : "4-8 weeks",
          detail: gapNames.length > 0
            ? `Focus on: ${gapNames.join(", ")}. Use online courses (Coursera, DataCamp) for 2-3 hours/day.`
            : "Polish your existing skills with relevant certifications.",
          type: "learn",
        },
        {
          title: "Build proof of skills",
          duration: "1-2 weeks",
          detail: "Create a portfolio project, case study, or work sample that demonstrates your new skills in action.",
          type: "do",
        },
        {
          title: "Rewrite CV for target role",
          duration: "2-3 days",
          detail: `Restructure your CV to highlight transferable skills. Lead with ${(match.matchedSkills || []).slice(0, 3).map((s) => s.name).join(", ")}.`,
          type: "do",
        },
        {
          title: "Apply to 20+ roles",
          duration: "2-4 weeks",
          detail: `Target ${match.title} roles. Use our job search to find matches. Tailor each application.`,
          type: "apply",
        },
      ],
    },
    {
      type: "scenic",
      label: "Scenic Route",
      icon: "🗺️",
      colour: "text-blue-600",
      bgColour: "bg-blue-50 border-blue-200",
      timeline: gapCount <= 1 ? "3-6 months" : "6-12 months",
      description: "Gradual transition through stepping-stone roles. Lower risk, builds credibility along the way.",
      riskLevel: "Lower risk",
      salaryAtEnd: `£${Math.round(((match.salaryRange?.median || 35000) * 0.85) / 1000)}k initially, rising to £${Math.round((match.salaryRange?.median || 35000) / 1000)}k`,
      steps: [
        {
          title: "Start upskilling part-time",
          duration: "1-3 months",
          detail: `Dedicate 5-10 hours/week to learning ${gapNames.slice(0, 2).join(" and ") || "relevant skills"}. Evening courses or online at your own pace.`,
          type: "learn",
        },
        {
          title: "Find a stepping-stone role",
          duration: "1-2 months",
          detail: "Look for a role that bridges your current experience with your target. Example: a coordinator or assistant role in the target field.",
          type: "apply",
        },
        {
          title: "Build experience in the new field",
          duration: "3-6 months",
          detail: "Use the stepping-stone role to gain industry knowledge, build your network, and develop remaining skills on the job.",
          type: "do",
        },
        {
          title: "Move into target role",
          duration: "1-2 months",
          detail: `Apply for ${match.title} positions with your now-proven experience in the field. Internal promotion or external move.`,
          type: "apply",
        },
      ],
    },
    {
      type: "wildcard",
      label: "Wildcard Route",
      icon: "✨",
      colour: "text-purple-600",
      bgColour: "bg-purple-50 border-purple-200",
      timeline: "Varies",
      description: "Unconventional paths that others with similar profiles have taken successfully. Sometimes the unexpected route is the best one.",
      riskLevel: "Unpredictable",
      salaryAtEnd: "Varies widely",
      steps: [
        {
          title: "Freelance or volunteer in the target area",
          duration: "1-3 months",
          detail: "Take on a small freelance project or volunteer role to test the waters and build a portfolio without leaving your current position.",
          type: "do",
        },
        {
          title: "Network with people who made this transition",
          duration: "Ongoing",
          detail: "Find 3-5 people on LinkedIn who made a similar career change. Ask for 15-minute conversations. Their insights are invaluable.",
          type: "do",
        },
        {
          title: "Create content about your transition",
          duration: "Ongoing",
          detail: "Write about your career change journey on LinkedIn or a blog. This builds your personal brand and attracts opportunities you would not find through job boards.",
          type: "do",
        },
        {
          title: "Apply to companies that value diverse backgrounds",
          duration: "When ready",
          detail: "Target companies known for hiring career changers. Startups, scale-ups, and companies with formal returnship programmes.",
          type: "apply",
        },
      ],
    },
  ];
}

function StepBadge({ type }: { type: "learn" | "do" | "apply" }) {
  const styles = {
    learn: "bg-amber-100 text-amber-700",
    do: "bg-blue-100 text-blue-700",
    apply: "bg-green-100 text-green-700",
  };
  const labels = { learn: "Learn", do: "Build", apply: "Apply" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function CareerGPSPage() {
  const router = useRouter();
  const [match, setMatch] = useState<CareerMatch | null>(null);
  const [allMatches, setAllMatches] = useState<CareerMatch[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<"express" | "scenic" | "wildcard">("scenic");

  useEffect(() => {
    const stored = sessionStorage.getItem("assessment");
    if (!stored) {
      router.push("/discover");
      return;
    }
    try {
      const data = JSON.parse(stored);
      const matches = data.matches || [];
      setAllMatches(matches);
      if (matches.length > 0) setMatch(matches[0]);
    } catch {
      router.push("/discover");
    }
  }, [router]);

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading your career GPS...</p>
      </div>
    );
  }

  const routes = buildRoutes(match);
  const activeRoute = routes.find((r) => r.type === selectedRoute) || routes[1];
  const gapSkillCourses = (match.gapSkills || []).slice(0, 2).flatMap((s) => getCourseRecommendations(s.name).slice(0, 1));
  const cvRec = getCvBuilderRecommendation(match.title);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          🗺️ Career GPS
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Your Route to {match.title}
        </h1>
        <p className="mt-3 text-gray-500">
          {match.matchPercentage}% skill match. Three ways to get there.
        </p>
      </div>

      {/* Career selector (if multiple matches) */}
      {allMatches.length > 1 && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">Choose a career to map:</label>
          <div className="flex flex-wrap gap-2">
            {allMatches.slice(0, 6).map((m) => (
              <button
                key={m.occupationId}
                onClick={() => setMatch(m)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  match.occupationId === m.occupationId
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {m.title} ({m.matchPercentage}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Route selector */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {routes.map((route) => (
          <button
            key={route.type}
            onClick={() => setSelectedRoute(route.type)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedRoute === route.type
                ? route.bgColour + " shadow-md"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="text-2xl mb-1">{route.icon}</div>
            <div className={`font-semibold text-sm ${selectedRoute === route.type ? route.colour : "text-gray-900"}`}>
              {route.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{route.timeline}</div>
          </button>
        ))}
      </div>

      {/* Active route detail */}
      <div className={`rounded-xl border-2 p-6 sm:p-8 mb-8 ${activeRoute.bgColour}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{activeRoute.icon}</span>
          <div>
            <h2 className={`text-xl font-bold ${activeRoute.colour}`}>
              {activeRoute.label}
            </h2>
            <p className="text-sm text-gray-600">{activeRoute.description}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-xs text-gray-500">Timeline</div>
            <div className="font-semibold text-gray-900">{activeRoute.timeline}</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-xs text-gray-500">Expected Salary</div>
            <div className="font-semibold text-gray-900">{activeRoute.salaryAtEnd}</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-xs text-gray-500">Risk Level</div>
            <div className="font-semibold text-gray-900">{activeRoute.riskLevel}</div>
          </div>
        </div>

        {/* Steps timeline */}
        <div className="space-y-4">
          {activeRoute.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  step.type === "learn" ? "bg-amber-500" : step.type === "do" ? "bg-blue-500" : "bg-green-500"
                }`}>
                  {i + 1}
                </div>
                {i < activeRoute.steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <StepBadge type={step.type} />
                </div>
                <div className="text-xs text-gray-400 mb-1">{step.duration}</div>
                <p className="text-sm text-gray-600">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      {gapSkillCourses.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Recommended Courses</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {gapSkillCourses.map((course) => (
              <a
                key={course.url}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
              >
                <div className="text-sm font-medium text-indigo-600">{course.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{course.provider} - {course.description}</div>
              </a>
            ))}
            <a
              href={cvRec.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
            >
              <div className="text-sm font-medium text-indigo-600">{cvRec.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{cvRec.description}</div>
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/jobs?q=${encodeURIComponent(match.title)}`}
          className="flex-1 text-center bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Find {match.title} Jobs
        </Link>
        <Link
          href="/discover/results"
          className="flex-1 text-center border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back to All Matches
        </Link>
      </div>
    </div>
  );
}
