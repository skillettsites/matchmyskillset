import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Job Is Right for Me? (Find Out in 2 Minutes)",
  description:
    "Not sure what career suits you? Structured framework to figure out what job is right for you based on your skills, values, personality, and lifestyle needs.",
  keywords: [
    "what job is right for me",
    "how to find the right career",
    "what career suits me",
    "career guidance UK",
    "career choice help",
    "find the right job",
  ],
  openGraph: {
    title: "What Job Is Right for Me? (2026 Guide)",
    description: "Structured approach to figuring out the right career for your skills, values, and lifestyle.",
    type: "article",
  },
};

export default function WhatJobIsRightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "What Job Is Right for Me? (2026 Guide)",
            description: "Framework to find the right career based on skills, values, personality, and lifestyle.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">What Job Is Right for Me</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        What Job Is Right for Me?
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>10 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        "What should I do with my life?" is one of the most searched career questions in the UK. And most answers are unhelpfully vague: "follow your passion" or "do what makes you happy." That advice sounds lovely but gives you nothing to act on.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Finding the right career is not about discovering a hidden calling. It is about matching four practical factors: your skills, your values, your personality, and your lifestyle needs. When these align, work feels purposeful rather than painful.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide gives you a structured framework to figure it out, not through vague reflection, but through concrete analysis.
      </p>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Skip the soul-searching. Let data decide.</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your actual skills and experience to careers you qualify for. 2 minutes.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Factor 1: Skills */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Factor 1: What are you actually good at?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Not what you enjoy (that comes later). What are you genuinely skilled at? The distinction matters because enjoyment without competence leads to frustration, while competence without enjoyment is tolerable and often turns into engagement over time.
        </p>
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Skill audit questions</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>What tasks do colleagues ask you for help with?</li>
            <li>What comes easily to you that others find difficult?</li>
            <li>What have you been complimented on at work (not just praised for completing)?</li>
            <li>If you were freelancing tomorrow, what service could you sell?</li>
            <li>What could you teach someone else to do?</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">
          Your answers point to your natural strengths. These are the skills that should drive your career choice, because you will always outperform in areas of natural competence.
        </p>
      </section>

      {/* Factor 2: Values */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Factor 2: What do you actually value?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Values misalignment is the hidden cause of most career dissatisfaction. You can be good at a job and still hate it if it clashes with what you care about.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { value: "Autonomy", careers: "Freelancing, consulting, self-employment, research" },
            { value: "Security", careers: "Civil service, NHS, teaching, established corporates" },
            { value: "Impact", careers: "Charity, healthcare, education, social enterprise" },
            { value: "Creativity", careers: "Design, writing, marketing, architecture, media" },
            { value: "Money", careers: "Sales, finance, tech, law, consulting" },
            { value: "Flexibility", careers: "Remote work, freelancing, portfolio careers" },
            { value: "Status", careers: "Law, medicine, management consulting, finance" },
            { value: "Teamwork", careers: "Project management, healthcare, events, agency" },
          ].map((v) => (
            <div key={v.value} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="font-semibold text-indigo-600 text-sm mb-1">{v.value}</div>
              <p className="text-xs text-gray-600">{v.careers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 2 */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">Still not sure? Let the AI figure it out.</h3>
        <p className="text-gray-300 text-sm mb-4">Upload your CV or describe your experience and our AI will analyse your skills, spot patterns, and match you to careers.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Get My Personalised Matches
        </Link>
      </div>

      {/* Factor 3: Personality */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Factor 3: What is your working style?</h2>
        <div className="space-y-4">
          {[
            { style: "I prefer working alone", suggestion: "Data analysis, writing, software development, research. See our guide to jobs for introverts." },
            { style: "I thrive with people", suggestion: "Sales, HR, teaching, events, recruitment, management consulting." },
            { style: "I need variety and change", suggestion: "Journalism, consulting, project management, emergency services." },
            { style: "I like routine and predictability", suggestion: "Accounting, compliance, quality assurance, civil service, library science." },
            { style: "I want to solve problems", suggestion: "Engineering, data science, cybersecurity, medicine, UX research." },
            { style: "I want to create things", suggestion: "Design, writing, video production, architecture, software development." },
          ].map((item) => (
            <div key={item.style} className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.style}</h3>
              <p className="text-sm text-gray-600">{item.suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Factor 4: Lifestyle */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Factor 4: What lifestyle do you need?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The best career for you is not just about the work itself. It is about whether the job fits around the life you want to live.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Need flexible hours?</h3>
            <p className="text-sm text-gray-600">Freelancing, remote tech roles, portfolio careers, and output-based roles (where results matter more than hours) offer the most schedule control.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Need high income?</h3>
            <p className="text-sm text-gray-600">Tech, sales, finance, consulting, and skilled trades offer the highest earning potential. Sales and trades have the lowest barriers to entry.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Need low stress?</h3>
            <p className="text-sm text-gray-600">Library work, data entry, technical writing, and archiving are among the lowest-stress careers. Avoid client-facing sales and emergency services.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Need to work from home?</h3>
            <p className="text-sm text-gray-600">Software development, content writing, data analysis, virtual assistance, and digital marketing are fully remote in most companies.</p>
          </div>
        </div>
      </section>

      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The fastest way to answer "What job is right for me?" is to analyse what you already bring to the table.</span> Our AI does this in 2 minutes.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Try it free</Link>.
        </p>
      </div>

      <p className="text-gray-600 mb-10">
        Want a personalised answer?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your career matches &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Get your personalised career matches</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV or describe your experience and our AI will match you to careers based on your actual skills. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-people-who-hate-their-job" className="text-sm text-indigo-600 hover:text-indigo-700">I Hate My Job</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-jobs-for-work-life-balance" className="text-sm text-indigo-600 hover:text-indigo-700">Work-Life Balance Jobs</Link>
        </div>
      </div>
    </div>
  );
}
