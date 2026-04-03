import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Write a CV for Career Change (2026 Guide + Tips)",
  description:
    "Step-by-step guide to writing a career change CV that gets interviews. Skills-based format, transferable skills framing, and ATS optimisation. Free template approach.",
  keywords: [
    "career change CV template",
    "how to write CV career change",
    "skills based CV",
    "career change CV UK",
    "transferable skills CV",
    "career change resume",
  ],
  openGraph: {
    title: "How to Write a CV for Career Change (2026)",
    description: "Skills-based CV approach for career changers. Beat ATS systems and get interviews.",
    type: "article",
  },
};

export default function CareerChangeCVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to Write a CV for Career Change (2026 Guide)",
            description: "Step-by-step guide to writing a career change CV using a skills-based format.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Career Change CV Guide</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        How to Write a CV for a Career Change
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        A standard chronological CV is designed to show career progression within the same field. When you are changing careers, it actively works against you by highlighting that your job titles do not match the role you are applying for. You need a different approach.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        88% of CVs are filtered out by Applicant Tracking Systems (ATS) before a human ever reads them. Career changers are disproportionately affected because their previous job titles do not contain the keywords the ATS is scanning for. This guide shows you how to beat both the ATS and the human reviewer.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        The core principle: lead with skills and achievements that match the target role, not with a history of jobs in a different field.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">88%</div>
          <div className="text-xs text-gray-500">CVs filtered by ATS</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">7 secs</div>
          <div className="text-xs text-gray-500">Avg recruiter initial scan</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">76%</div>
          <div className="text-xs text-gray-500">Employers: skills over titles</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Know which skills to highlight before you write</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will identify every transferable skill and show which careers they match.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* The Format */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Career Change CV Structure</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Forget the standard format. Here is the structure that works for career changers:
        </p>
        <div className="space-y-6">
          {[
            { section: "1. Professional Summary (4-5 lines)", content: "Open with a compelling summary that bridges your past and your target. Mention your years of experience, your transferable skills, and what you bring to the new role. Include keywords from the target job description.", example: "\"Experienced project coordinator with 8 years of programme management in education, now transitioning to corporate project management. Proven track record in stakeholder engagement, budget oversight, and delivering complex programmes on time. PRINCE2 Foundation certified.\"" },
            { section: "2. Key Skills (6-8 bullet points)", content: "List the skills the target role requires that you genuinely possess. Use the exact wording from the job description. This section exists primarily for ATS scanning, but it also tells the human reader, in the first 7 seconds, that you have what they need.", example: "Project planning, Stakeholder management, Budget management, Risk assessment, Team leadership, Process improvement, Data analysis, Communication" },
            { section: "3. Relevant Achievements (3-5 entries)", content: "Before listing your work history, add a section of achievements that directly relate to your target role. Pull these from any context: work, volunteering, side projects, personal projects. Frame them with the STAR method and include metrics.", example: "\"Led a cross-functional team of 12 to deliver a £50,000 school renovation project on time and under budget\" (this is project management, regardless of the setting)." },
            { section: "4. Work History (reverse chronological)", content: "Keep this section factual but reframe your bullet points around transferable skills. Do not lie about your job titles, but emphasise the tasks and achievements that relate to your target career.", example: "Instead of \"Taught GCSE English to 120 students\", write \"Designed and delivered learning programmes for groups of 30, consistently achieving 85%+ target attainment.\"" },
            { section: "5. Education & Certifications", content: "Lead with any certification relevant to your target career (even if recently completed). Then list your formal education. New certifications show commitment to the transition.", example: "PRINCE2 Foundation (2026), PGCE Secondary English (2018), BA English Literature (2017)" },
          ].map((s) => (
            <div key={s.section} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.section}</h3>
              <p className="text-sm text-gray-600 mb-3">{s.content}</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">Example</div>
                <p className="text-xs text-gray-700 italic">{s.example}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 2 */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">Struggling to identify your transferable skills?</h3>
        <p className="text-gray-300 text-sm mb-4">Our AI reads your CV and pulls out every transferable skill, then maps them to the language employers in your target industry use.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Get My Personalised Matches
        </Link>
      </div>

      {/* ATS Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Beating ATS Systems</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Mirror the job description</h3>
            <p className="text-sm text-gray-600">ATS systems scan for keywords from the job description. If the ad says "stakeholder management," use that exact phrase on your CV, not "working with people."</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Use standard headings</h3>
            <p className="text-sm text-gray-600">"Work Experience," "Education," "Skills." ATS systems expect these headings. Creative alternatives like "My Journey" or "What I Bring" confuse the parser.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Avoid tables and graphics</h3>
            <p className="text-sm text-gray-600">Most ATS systems cannot read tables, text boxes, or graphics. Keep your CV in plain text with clear formatting. Save as PDF unless they specify Word.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Tailor every application</h3>
            <p className="text-sm text-gray-600">Sending the same CV to every job is a career changer's biggest mistake. Adjust your professional summary and key skills section for each application.</p>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Career Change CV Mistakes</h2>
        <div className="space-y-4">
          {[
            { mistake: "Leading with irrelevant job titles", fix: "Lead with your skills section and professional summary instead. Your job titles go in the work history section, not the headline." },
            { mistake: "Writing \"Career Changer\" as your headline", fix: "Instead, write the title of the role you want: \"Project Manager\" or \"Data Analyst.\" Own the identity of your target career." },
            { mistake: "Including everything from the past 15 years", fix: "Only include details that support your target career. A two-page CV focused on relevant experience beats a four-page life story." },
            { mistake: "Apologising for the change in your cover letter", fix: "Frame the change positively: \"My 8 years of programme management in education have given me a strong foundation for corporate project management.\"" },
          ].map((item) => (
            <div key={item.mistake} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-700 mb-1">Mistake</div>
                  <p className="text-xs text-red-800">{item.mistake}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-700 mb-1">Do this instead</div>
                  <p className="text-xs text-green-800">{item.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The best career change CVs start with knowing your transferable skills.</span> Our AI identifies skills you did not know you had and maps them to specific careers.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Try it free</Link>.
        </p>
      </div>

      <p className="text-gray-600 mb-10">
        Want to know which skills to feature on your CV?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV for a free skills analysis &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Start with your skills, then write your CV</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and our AI identifies every transferable skill and matches them to careers. Then you will know exactly what to highlight. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-50" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 50</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
          <span className="text-gray-300">|</span>
          <Link href="/what-job-is-right-for-me" className="text-sm text-indigo-600 hover:text-indigo-700">What Job Is Right for Me?</Link>
        </div>
      </div>
    </div>
  );
}
