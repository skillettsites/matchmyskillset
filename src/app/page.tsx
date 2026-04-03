import Link from "next/link";

const stats = [
  { value: "33%", label: "of UK workers want to change careers" },
  { value: "242", label: "average applicants per job opening" },
  { value: "88%", label: "of employers say ATS filters out good candidates" },
  { value: "0.4%", label: "average callback rate on applications" },
];

const steps = [
  {
    number: "1",
    title: "Tell Us Your Skills",
    description:
      "Paste your CV, describe your experience, or just tell us what you have done. We recognise skills from work, volunteering, parenting, and everything in between.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "AI Discovers Your Matches",
    description:
      "Our AI analyses your actual skills and maps them to careers you never knew existed. Not keyword matching. Real skills intelligence.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Find Real Jobs",
    description:
      "See thousands of real UK jobs ranked by how well your skills match. Plus exclusive roles from our recruitment network that you will not find anywhere else.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Free. No signup needed.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Discover careers you{" "}
              <span className="text-indigo-300">never knew existed</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-indigo-200 max-w-2xl">
              Our AI analyses your actual skills and matches you to jobs you
              would never have searched for. Not keywords. Not job titles. Your
              real, transferable skills.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/discover"
                className="inline-flex items-center justify-center bg-white text-indigo-900 font-semibold text-lg px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/30"
              >
                Discover My Careers
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center border border-white/30 text-white font-medium text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Three steps to discovering career paths you never considered.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:border-indigo-100 transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + Human section */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              AI-Assisted. Human-Led.
            </h2>
            <p className="mt-6 text-lg text-gray-500">
              Our AI discovers the possibilities. Our recruitment experts
              validate them. You get the best of both worlds: the intelligence
              of AI with the judgement of experienced recruiters who understand
              the real job market.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-left">
                <div className="text-indigo-600 font-semibold mb-2">
                  AI Does
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Extracts skills from your experience</li>
                  <li>Maps skills to thousands of careers</li>
                  <li>Identifies skills gaps with learning paths</li>
                  <li>Searches thousands of live UK jobs</li>
                  <li>Ranks jobs by your actual skill match</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-left">
                <div className="text-green-600 font-semibold mb-2">
                  Humans Do
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Validate career direction recommendations</li>
                  <li>Review and improve your applications</li>
                  <li>Source exclusive unadvertised roles</li>
                  <li>Provide industry-specific guidance</li>
                  <li>Support you through career transitions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to discover what you could become?
          </h2>
          <p className="mt-4 text-lg text-indigo-200">
            Free. No signup required. Takes 2 minutes.
          </p>
          <Link
            href="/discover"
            className="mt-8 inline-flex items-center justify-center bg-white text-indigo-700 font-semibold text-lg px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Discover My Careers
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
