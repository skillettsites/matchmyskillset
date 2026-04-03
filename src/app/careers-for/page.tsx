import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change Ideas by Profession",
  description:
    "Discover new career paths based on your current profession. Find jobs that match your transferable skills, from teaching to tech and beyond.",
};

const professions = [
  {
    slug: "teachers",
    title: "Teachers",
    description: "Teaching builds exceptional skills in communication, project management, and people development. Discover roles like L&D Manager, UX Researcher, or Content Strategist.",
    topMatches: ["L&D Manager", "UX Researcher", "Instructional Designer", "Customer Success Manager", "Content Strategist"],
    icon: "📚",
  },
  {
    slug: "nurses",
    title: "Nurses & Healthcare Workers",
    description: "Clinical experience gives you empathy, crisis management, and analytical skills that translate across industries. Explore healthcare management, consultancy, and more.",
    topMatches: ["Healthcare Manager", "Clinical Trials Coordinator", "Health & Safety Officer", "Patient Liaison", "Counsellor"],
    icon: "🏥",
  },
  {
    slug: "construction",
    title: "Construction & Trades",
    description: "Construction professionals have strong project management, budget control, and health & safety skills. These transfer directly to corporate operations and management.",
    topMatches: ["Operations Manager", "Project Manager", "Facilities Manager", "Health & Safety Officer", "Quantity Surveyor"],
    icon: "🏗️",
  },
  {
    slug: "retail",
    title: "Retail & Hospitality",
    description: "Customer-facing experience builds exceptional people skills, sales ability, and operational management. These skills are highly valued across many industries.",
    topMatches: ["Customer Success Manager", "Business Development Manager", "Event Manager", "Recruitment Consultant", "Estate Agent"],
    icon: "🛍️",
  },
  {
    slug: "military",
    title: "Military & Armed Forces",
    description: "Military service develops leadership, strategic planning, risk management, and teamwork at the highest level. These skills are in huge demand in civilian roles.",
    topMatches: ["Operations Manager", "Project Manager", "Health & Safety Officer", "Management Consultant", "Logistics Manager"],
    icon: "🎖️",
  },
  {
    slug: "parents",
    title: "Parents Returning to Work",
    description: "Career breaks build real skills: project management, budgeting, crisis resolution, scheduling, and advocacy. We recognise and value this experience.",
    topMatches: ["Project Manager", "Event Manager", "HR Business Partner", "Customer Success Manager", "Charity Fundraiser"],
    icon: "👶",
  },
  {
    slug: "admin",
    title: "Admin & Office Workers",
    description: "Administrative experience gives you organisational skills, attention to detail, and stakeholder management that many higher-paying roles require.",
    topMatches: ["Executive Assistant", "Business Analyst", "Project Manager", "HR Business Partner", "Operations Manager"],
    icon: "💼",
  },
  {
    slug: "finance",
    title: "Finance & Accounting",
    description: "Financial skills are incredibly transferable. Data analysis, attention to detail, and commercial awareness open doors to many high-paying roles.",
    topMatches: ["Data Analyst", "Management Consultant", "Financial Analyst", "Business Analyst", "Compliance Officer"],
    icon: "📊",
  },
];

export default function CareersForPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Career Change Ideas by Profession
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Your current skills are more transferable than you think. Explore
          career paths matched to your background.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {professions.map((prof) => (
          <Link
            key={prof.slug}
            href={`/careers-for/${prof.slug}`}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all group"
          >
            <div className="text-3xl mb-3">{prof.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              Careers for {prof.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              {prof.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prof.topMatches.slice(0, 3).map((match) => (
                <span
                  key={match}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                >
                  {match}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center bg-indigo-50 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Not sure which career suits you?
        </h2>
        <p className="text-gray-500 mb-6">
          Our AI analyses your specific skills and experience to find careers
          you never knew existed. It takes 2 minutes and it is completely free.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Discover My Career Matches
        </Link>
      </div>
    </div>
  );
}
