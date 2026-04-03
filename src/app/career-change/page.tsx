import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change Guides - Practical Advice for Changing Careers",
  description:
    "Comprehensive career change guides covering transferable skills, CV writing, skills-based hiring, and how to switch careers at any age. Free expert advice.",
};

const guides = [
  {
    slug: "how-to-change-careers",
    title: "How to Change Careers: The Complete Guide",
    description:
      "A step-by-step walkthrough of the career change process, from self-assessment through to landing your first role in a new field. Practical, honest, and based on what actually works.",
    readTime: "12 min read",
    icon: "🧭",
    tags: ["Getting Started", "Strategy"],
  },
  {
    slug: "transferable-skills-guide",
    title: "Transferable Skills: Your Hidden Superpower",
    description:
      "Most people underestimate their skills by 40% or more. Learn how to identify, categorise, and sell the skills you already have to employers in completely different industries.",
    readTime: "10 min read",
    icon: "💡",
    tags: ["Skills", "Self-Assessment"],
  },
  {
    slug: "career-change-cv",
    title: "How to Write a Career Change CV",
    description:
      "Traditional CVs work against career changers. Learn the skills-first CV format that gets past ATS filters and convinces hiring managers you are the right fit, even without direct experience.",
    readTime: "9 min read",
    icon: "📝",
    tags: ["CV Writing", "Applications"],
  },
  {
    slug: "career-change-at-40",
    title: "Changing Careers at 40 (and Beyond)",
    description:
      "Your 20+ years of experience are not a liability. They are your biggest asset. Real statistics, honest advice, and a practical plan for making the switch in your 40s, 50s, or later.",
    readTime: "11 min read",
    icon: "🔄",
    tags: ["Age", "Experience"],
  },
  {
    slug: "skills-based-hiring",
    title: "Skills-Based Hiring: What It Means for Career Changers",
    description:
      "The biggest shift in recruitment in decades is working in your favour. More companies are dropping degree requirements and hiring for skills. Here is how to take advantage.",
    readTime: "8 min read",
    icon: "🎯",
    tags: ["Hiring Trends", "Opportunity"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Career Change Guides",
  description:
    "Comprehensive guides covering every aspect of changing careers, from transferable skills to CV writing and skills-based hiring.",
  url: "https://matchmyskillset.com/career-change",
  publisher: {
    "@type": "Organization",
    name: "MatchMySkillset",
    url: "https://matchmyskillset.com",
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: guides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://matchmyskillset.com/career-change/${g.slug}`,
      name: g.title,
    })),
  },
};

export default function CareerChangeHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Career Change Guides
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Practical, no-nonsense advice for people thinking about changing
          careers. Written by people who have actually done it.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-12 bg-indigo-50 rounded-xl p-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-700">33%</div>
          <div className="text-xs text-gray-500 mt-1">
            of UK workers want to change careers
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-700">72%</div>
          <div className="text-xs text-gray-500 mt-1">
            say they do not know where to start
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-700">88%</div>
          <div className="text-xs text-gray-500 mt-1">
            of good candidates filtered out by ATS
          </div>
        </div>
      </div>

      {/* Guide cards */}
      <div className="space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/career-change/${guide.slug}`}
            className="flex items-start gap-5 bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all group"
          >
            <div className="text-3xl flex-shrink-0 mt-0.5">{guide.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {guide.title}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-3">{guide.description}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{guide.readTime}</span>
                <div className="flex gap-1.5">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center bg-indigo-50 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Skip the reading. Discover your matches now.
        </h2>
        <p className="text-gray-500 mb-6">
          Our AI analyses your skills and experience to find careers you never
          knew existed. It takes 2 minutes and it is completely free.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Discover My Career Matches
        </Link>
      </div>

      {/* Related: Careers by Profession */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Related: Career Ideas by Profession
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Looking for career change ideas specific to your current job? We have
          detailed guides for specific professions.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { slug: "teachers", label: "Teachers" },
            { slug: "nurses", label: "Nurses" },
            { slug: "construction", label: "Construction" },
            { slug: "retail", label: "Retail" },
            { slug: "military", label: "Military" },
            { slug: "parents", label: "Parents" },
            { slug: "admin", label: "Admin" },
            { slug: "finance", label: "Finance" },
          ].map((prof) => (
            <Link
              key={prof.slug}
              href={`/careers-for/${prof.slug}`}
              className="text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {prof.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
