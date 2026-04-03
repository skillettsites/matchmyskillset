import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change at 30: Why It Is the Perfect Time (2026 Guide)",
  description:
    "Thinking of changing careers at 30? You are not too old. Research shows your 30s are actually the ideal decade for a career change. Data, success stories, and practical steps.",
  keywords: [
    "career change at 30",
    "is 30 too old to change career",
    "changing careers in your 30s",
    "career change 30 UK",
    "midlife career change",
    "career switch at 30",
  ],
  openGraph: {
    title: "Career Change at 30: Why It Is the Perfect Time",
    description: "Data-driven guide to career change in your 30s. Statistics, practical steps, and stories.",
    type: "article",
  },
};

export default function CareerChangeAt30Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is 30 too old to change career?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. 30 is actually an ideal age for a career change. You have enough experience to demonstrate transferable skills, but enough working years ahead (35+) to build a successful second career. Research from the London School of Economics shows that career changers in their 30s report higher job satisfaction than those who stay in unsatisfying roles.",
                },
              },
              {
                "@type": "Question",
                name: "How do I change career at 30 with no experience?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You likely have more relevant experience than you realise. Most career changers at 30 have 8-12 years of transferable skills in communication, problem solving, stakeholder management, and project coordination. The key is reframing your existing experience to match target role requirements.",
                },
              },
              {
                "@type": "Question",
                name: "What careers can I switch to at 30?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Almost any career is achievable at 30. Popular transitions include moving into tech (no degree required), project management, UX design, data analysis, L&D, and consulting. The fastest transitions leverage your existing transferable skills rather than starting from scratch.",
                },
              },
              {
                "@type": "Question",
                name: "Will I take a pay cut changing careers at 30?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A temporary pay cut is possible but not guaranteed. Many career changers maintain or increase their salary by targeting roles that value their existing skills. The key is matching your transferable skills to roles in higher-paying industries.",
                },
              },
            ],
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/career-change" className="hover:text-indigo-600">Career Change</Link>
        {" / "}<span className="text-gray-600">Career Change at 30</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Career Change at 30: Why It Is the Perfect Time
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>10 min read</span>
      </div>

      {/* Intro */}
      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        If you have landed on this page, you are probably asking yourself a version of the same question: "Is 30 too old to change career?" The short answer is no. The longer answer is that 30 might be the single best age to make a career change, and the data backs this up.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        One in three UK workers wants to change careers. That figure rises to 49% among 25-34 year olds. You are not having a crisis. You are having a perfectly rational response to the fact that the career you chose at 18 or 22 no longer fits the person you have become at 30.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide is built on data, not platitudes. We will show you why your 30s are ideal for a career change, the practical steps to take, and how your existing experience is more valuable than you think.
      </p>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">49%</div>
          <div className="text-xs text-gray-500">of 25-34s want to change career</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">35+</div>
          <div className="text-xs text-gray-500">Working years ahead of you</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">5-7</div>
          <div className="text-xs text-gray-500">Avg career changes in a lifetime</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">88%</div>
          <div className="text-xs text-gray-500">CVs filtered by ATS systems</div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Why 30 is actually the ideal age for a career change
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          At 30, you sit in a rare sweet spot. You have 8-12 years of real-world experience that has built substantial transferable skills. But you also have 35+ working years ahead of you, plenty of time to build genuine expertise in a new field and progress to senior roles.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Compare this to changing careers at 22, when you have enthusiasm but no track record, or at 50, when you have enormous experience but potentially face ageism and financial constraints. At 30, you have the best of both worlds.
        </p>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">The data says 30 is ideal</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold flex-shrink-0">1.</span>
              <span><strong>Research from the London School of Economics</strong> shows that career changers who switch in their late 20s to mid-30s report the highest levels of long-term job satisfaction.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold flex-shrink-0">2.</span>
              <span><strong>LinkedIn data</strong> shows that professionals who change careers at 30 reach the same seniority as non-changers within 5-7 years, and often surpass them because they bring diverse perspectives.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold flex-shrink-0">3.</span>
              <span><strong>The average person changes careers 5-7 times</strong> in their lifetime. If you are on your first change at 30, you are actually behind the curve.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold flex-shrink-0">4.</span>
              <span><strong>Neuroplasticity research</strong> confirms that your brain remains highly capable of learning new skills well into your 60s. The "too old to learn" myth is exactly that.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA 1 - Box */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Curious what your 8-12 years of experience qualifies you for?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will identify every transferable skill and match you to careers you have not considered.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your transferable skills are worth more than you think
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The biggest mistake career changers make is undervaluing their existing experience. You look at a job description for a Product Manager or UX Researcher and think "I have never done that." But you almost certainly have done many of the component skills, just under different names.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          A teacher with 8 years of experience has managed teams, designed programmes, presented to stakeholders, analysed performance data, and resolved conflicts. A nurse has made critical decisions under pressure, managed complex documentation, coordinated teams, and demonstrated extraordinary empathy. These are not soft skills. They are high-value competencies that many industries struggle to hire for.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Skills you probably have (and undervalue)</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>Stakeholder management</li>
              <li>Project coordination</li>
              <li>Written and verbal communication</li>
              <li>Problem solving under pressure</li>
              <li>Training and mentoring</li>
              <li>Data analysis (basic level)</li>
              <li>Budget awareness</li>
              <li>Conflict resolution</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">What employers actually look for</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>76% prioritise skills over qualifications</li>
              <li>Problem solving is the #1 desired skill</li>
              <li>Communication skills outrank technical ability</li>
              <li>Diverse experience is valued for fresh perspectives</li>
              <li>EQ (emotional intelligence) beats IQ for leadership</li>
              <li>Adaptability is the fastest-growing requirement</li>
              <li>Self-motivation and initiative score highly</li>
              <li>Cultural fit often matters more than experience</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA 2 - Dark */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">You have more transferable skills than you realise</h3>
        <p className="text-gray-300 text-sm mb-4">88% of CVs are rejected by ATS systems before a human sees them. Our AI reads between the lines and finds the hidden skills that job boards miss.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Upload My CV for AI Analysis
        </Link>
      </div>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Practical steps for changing careers at 30
        </h2>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 1.</span>Audit your actual skills (not your job titles)
            </h3>
            <p className="text-sm text-gray-600">
              Write down every task you do in a typical month. Not your job description, but what you actually spend your time doing. Group these into skill categories: communication, analysis, leadership, creative, technical. You will be surprised how many you have. Better yet, upload your CV and let our AI do this for you in 2 minutes.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 2.</span>Identify target roles based on skill overlap
            </h3>
            <p className="text-sm text-gray-600">
              Do not browse job boards hoping something appeals to you. Instead, work backwards from your skills. If you have 7 out of 10 skills a role requires, you are a competitive candidate. The remaining 3 can often be learned in weeks or months, not years. Our <Link href="/discover" className="text-indigo-600 hover:text-indigo-700 font-medium">career matching tool</Link> automates this process.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 3.</span>Close the gap without quitting your day job
            </h3>
            <p className="text-sm text-gray-600">
              Most career changes do not require going back to university. A 6-week online course, a professional certification, or a portfolio of side projects is usually enough. PRINCE2 takes 1 week. Google Data Analytics takes 6 months part-time. A UX bootcamp takes 12-16 weeks. Plan your learning around your current job.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 4.</span>Rewrite your CV as a skills-based document
            </h3>
            <p className="text-sm text-gray-600">
              A chronological CV works when you are progressing in the same field. For career changers, a skills-based format is more effective. Lead with the skills the target role needs, then provide evidence from your experience. Read our <Link href="/career-change/career-change-cv" className="text-indigo-600 hover:text-indigo-700 font-medium">career change CV guide</Link> for a step-by-step process.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 5.</span>Build your network in the target industry
            </h3>
            <p className="text-sm text-gray-600">
              Informational interviews are the most underused tool in career change. Reach out to 5-10 people on LinkedIn who work in your target role. Ask them how they got there, what skills matter most, and what they wish they had known. Most people are happy to share their experience.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">Step 6.</span>Apply strategically, not en masse
            </h3>
            <p className="text-sm text-gray-600">
              Apply to 10 roles with tailored CVs and cover letters rather than 100 with the same generic application. Each application should demonstrate how your specific experience maps to their requirements. Quality beats quantity every time when you are changing careers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA 3 - Inline text */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The first step is the hardest.</span> Once you see which careers match your existing skills, the whole process becomes less daunting. Our AI identifies your transferable skills in 2 minutes.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Try it free</Link>.
        </p>
      </div>

      {/* Section 4 - Popular transitions */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Popular career changes at 30
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          These are some of the most common and successful career transitions for people in their early 30s. Each leverages existing skills rather than starting from scratch.
        </p>
        <div className="space-y-4">
          {[
            { from: "Teacher", to: "L&D Manager / Instructional Designer", timeframe: "3-6 months", link: "/careers-for/teachers" },
            { from: "Nurse", to: "Health & Safety Officer / Clinical Trials Coordinator", timeframe: "2-4 months", link: "/careers-for/nurses" },
            { from: "Retail Manager", to: "Customer Success Manager / Recruitment Consultant", timeframe: "1-3 months", link: "/careers-for/retail" },
            { from: "Admin/Office", to: "Project Manager / Business Analyst", timeframe: "2-6 months", link: "/careers-for/admin" },
            { from: "Construction", to: "Operations Manager / Facilities Manager", timeframe: "1-3 months", link: "/careers-for/construction" },
            { from: "Finance", to: "Data Analyst / Management Consultant", timeframe: "3-6 months", link: "/careers-for/finance" },
          ].map((t) => (
            <div key={t.from} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{t.from}</span>
                  <span className="text-gray-400">to</span>
                  <span className="text-sm font-semibold text-indigo-600">{t.to}</span>
                </div>
                <span className="text-xs text-gray-500">Typical transition: {t.timeframe}</span>
              </div>
              <Link href={t.link} className="text-xs text-indigo-600 font-medium hover:text-indigo-700 whitespace-nowrap">
                Read full guide
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5 - Common fears */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Addressing the fears
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">"I will take a pay cut"</h3>
            <p className="text-sm text-gray-600">Maybe temporarily, but not necessarily. Many career changers maintain or increase their salary by targeting industries that pay more for their existing skills. A teacher earning £35k who moves into L&D at £45k gets a pay rise, not a cut. The key is matching your skills to higher-paying sectors.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">"I have wasted my 20s"</h3>
            <p className="text-sm text-gray-600">You have not. Every year of experience built transferable skills. Those 8-12 years of communication, problem solving, and stakeholder management give you a foundation that fresh graduates cannot match. Your experience is an asset, not a liability.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">"Nobody will hire a career changer"</h3>
            <p className="text-sm text-gray-600">76% of UK employers now say they prioritise skills over qualifications. The skills-based hiring movement is growing rapidly. Companies like Google, Apple, and EY have removed degree requirements from most roles. Your diverse experience is increasingly seen as a competitive advantage.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">"I need to go back to university"</h3>
            <p className="text-sm text-gray-600">Almost certainly not. Most career transitions require a short professional certification (weeks, not years) plus evidence of practical ability. Portfolios, projects, and certifications carry more weight than degrees for career changers.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Ready to explore what is possible?
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your experience. Our AI will show you exactly which careers match your skills, what gaps to close, and how to get there. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Discover My Career Matches
          </Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">
            Take the Career Quiz
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Is 30 too old to change career?</h3>
            <p className="text-sm text-gray-600">No. With 35+ working years ahead and 8-12 years of transferable skills behind you, 30 is widely considered the best age for a career change. Research backs this up consistently.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How long does a career change take at 30?</h3>
            <p className="text-sm text-gray-600">Most successful career changers land their new role within 3-9 months. The timeline depends on how much retraining is needed. Transitions that leverage existing skills (e.g., teacher to L&D) can happen in weeks.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">What are the best careers to switch to at 30?</h3>
            <p className="text-sm text-gray-600">The best career is the one that matches your existing skills. Popular switches include project management, data analysis, UX design, and L&D. Use our <Link href="/discover" className="text-indigo-600 hover:text-indigo-700 font-medium">career matching tool</Link> to find your specific matches.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Can I change career at 30 with no qualifications?</h3>
            <p className="text-sm text-gray-600">Yes. Skills-based hiring means employers increasingly prioritise what you can do over what certificates you hold. See our guide to <Link href="/career-change-no-experience" className="text-indigo-600 hover:text-indigo-700 font-medium">career change with no experience</Link>.</p>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change/career-change-at-40" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 40</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-no-experience" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Experience</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change by Profession</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change/transferable-skills-guide" className="text-sm text-indigo-600 hover:text-indigo-700">Transferable Skills Guide</Link>
        </div>
      </div>
    </div>
  );
}
