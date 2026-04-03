import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - Free Skills Assessment & Pro Career Matching",
  description:
    "Start free with our AI skills assessment. Upgrade to Pro for unlimited assessments, career GPS, priority job matching, and expert CV reviews.",
};

const tiers = [
  {
    name: "Free",
    price: "£0",
    period: "",
    description: "Discover your career matches",
    cta: "Get Started Free",
    ctaHref: "/discover",
    ctaStyle: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    features: [
      "1 skills assessment per month",
      "Top 5 career matches",
      "Skills profile with categories",
      "Browse jobs from Reed, Adzuna + more",
      "Basic affiliate course recommendations",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "£7.99",
    period: "/month",
    description: "Serious about your career change",
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
    ctaStyle: "bg-indigo-600 text-white hover:bg-indigo-700",
    badge: "Most Popular",
    features: [
      "Unlimited skills assessments",
      "Top 10 career matches with full detail",
      "Career GPS (Express, Scenic, Wildcard routes)",
      "Skills gap analysis with course recommendations",
      "Priority job matching with match scores",
      "CV review and optimisation tips",
      "Email alerts for matching jobs",
      "Save and compare multiple assessments",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "£14.99",
    period: "/month",
    description: "Expert support for your transition",
    cta: "Start Premium Trial",
    ctaHref: "/signup?plan=premium",
    ctaStyle: "border border-indigo-200 text-indigo-700 hover:bg-indigo-50",
    features: [
      "Everything in Pro",
      "1:1 career coaching session per month (15 min)",
      "Direct introductions to employers",
      "Hidden jobs from our recruitment network",
      "Skills certification with verified badges",
      "Application tracking dashboard",
      "Priority support",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Start free. Upgrade when you are ready to get serious about your
          career change.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-6 sm:p-8 flex flex-col ${
              tier.highlighted
                ? "bg-indigo-50 border-2 border-indigo-300 relative"
                : "bg-white border border-gray-200"
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {tier.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{tier.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-gray-500">{tier.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-indigo-600" : "text-green-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={`block text-center font-semibold py-3 rounded-xl transition-colors ${tier.ctaStyle}`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* For Employers */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8 sm:p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          For Employers
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-6">
          Get a curated shortlist of candidates whose skills genuinely match
          your roles. From £199/month or pay-per-hire.
        </p>
        <Link
          href="/about#employers"
          className="inline-flex items-center bg-gray-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Learn More
        </Link>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900">
              Can I use it completely free?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Yes. The free tier gives you one full skills assessment per month
              with your top 5 career matches, plus unlimited job browsing. Many
              users find their next career through the free tier alone.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              What makes Pro worth it?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Pro gives you unlimited assessments (test different CV versions),
              the Career GPS with three transition routes, and priority job
              matching that shows you your match percentage for every role. If
              you are actively making a career change, Pro pays for itself with
              one successful application.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Can I cancel anytime?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Yes. No contracts, no cancellation fees. Cancel in one click from
              your dashboard.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              What is the 1:1 coaching in Premium?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              A 15-minute call with an experienced recruitment consultant who
              specialises in career transitions. They review your AI results,
              validate your career direction, and give specific advice for your
              situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
