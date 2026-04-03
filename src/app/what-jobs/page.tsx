import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Jobs Can I Get With My Skills? - Skills to Career Matcher",
  description:
    "Discover what jobs you can get with your specific skills and experience. Our AI analyses your transferable skills and finds career matches you never considered.",
};

const skillQueries = [
  { slug: "teaching-skills", label: "Teaching Skills", icon: "📚", desc: "Communication, curriculum design, mentoring, stakeholder management" },
  { slug: "project-management-skills", label: "Project Management Skills", icon: "📋", desc: "Planning, budgeting, team coordination, risk management" },
  { slug: "customer-service-skills", label: "Customer Service Skills", icon: "🤝", desc: "Communication, problem solving, empathy, conflict resolution" },
  { slug: "nursing-skills", label: "Nursing Skills", icon: "🏥", desc: "Patient care, clinical assessment, crisis management, empathy" },
  { slug: "sales-skills", label: "Sales Skills", icon: "💰", desc: "Negotiation, persuasion, relationship building, target management" },
  { slug: "admin-skills", label: "Admin Skills", icon: "💼", desc: "Organisation, attention to detail, Microsoft Office, coordination" },
  { slug: "management-skills", label: "Management Skills", icon: "👔", desc: "Team leadership, strategic planning, budget control, decision making" },
  { slug: "writing-skills", label: "Writing Skills", icon: "✍️", desc: "Content creation, copywriting, editing, storytelling" },
  { slug: "data-analysis-skills", label: "Data Analysis Skills", icon: "📊", desc: "Excel, SQL, data visualisation, critical thinking" },
  { slug: "creative-skills", label: "Creative Skills", icon: "🎨", desc: "Design, video, photography, branding, innovation" },
  { slug: "construction-skills", label: "Construction Skills", icon: "🏗️", desc: "Site management, H&S, budgets, contractor coordination" },
  { slug: "military-skills", label: "Military Skills", icon: "🎖️", desc: "Leadership, logistics, risk management, strategic planning" },
  { slug: "accounting-skills", label: "Accounting Skills", icon: "🧮", desc: "Financial analysis, Excel, compliance, attention to detail" },
  { slug: "caring-skills", label: "Caring & Parenting Skills", icon: "❤️", desc: "Multitasking, crisis management, budgeting, scheduling" },
  { slug: "it-support-skills", label: "IT Support Skills", icon: "🖥️", desc: "Troubleshooting, technical communication, systems admin" },
  { slug: "retail-skills", label: "Retail Skills", icon: "🛍️", desc: "Customer service, sales, stock management, team leadership" },
];

export default function WhatJobsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          What Jobs Can I Get With My Skills?
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Your skills are more valuable than you think. Choose your area below
          to see which careers match, or let our AI analyse your specific
          experience.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-flex items-center bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Analyse My Specific Skills
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {skillQueries.map((q) => (
          <Link
            key={q.slug}
            href={`/what-jobs/${q.slug}`}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-indigo-100 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{q.icon}</span>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  What jobs can I get with {q.label.toLowerCase()}?
                </h2>
                <p className="text-sm text-gray-500 mt-1">{q.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-indigo-50 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Your skills are unique. Get a personalised match.
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          The pages above show general matches. For results specific to YOUR
          experience, upload your CV and our AI will find careers tailored to you.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Upload My CV for Free Analysis
        </Link>
      </div>
    </div>
  );
}
