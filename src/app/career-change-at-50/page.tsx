import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change at 50: It Is Not Too Late (2026 Guide)",
  description:
    "Thinking of changing careers at 50? You have 15-20 working years left and decades of transferable skills. Data-driven guide with practical steps, age discrimination tips, and role suggestions.",
  keywords: [
    "career change at 50",
    "is it too late to change career at 50",
    "changing careers at 50 UK",
    "career change later in life",
    "new career at 50",
    "career options at 50",
  ],
  openGraph: {
    title: "Career Change at 50: It Is Not Too Late",
    description:
      "Data-driven guide to changing careers in your 50s. Practical steps, salary data, and how to beat age discrimination.",
    type: "article",
  },
};

export default function CareerChangeAt50Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Career Change at 50: It Is Not Too Late (2026 Guide)",
            description:
              "Comprehensive guide to changing careers at 50 with practical steps and role suggestions.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: {
              "@type": "Organization",
              name: "MatchMySkillset",
              url: "https://matchmyskillset.com",
            },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/career-change" className="hover:text-indigo-600">Career Change</Link>
        {" / "}
        <span className="text-gray-600">Career Change at 50</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Career Change at 50: It Is Not Too Late
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        You are 50, and the career you have spent decades building no longer fits. Maybe the industry has changed. Maybe you have changed. Maybe redundancy forced the question. Whatever the reason, you are wondering whether it is realistic to start something new at this stage.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The honest answer: yes, it is realistic. The UK state pension age is 67 and rising. That gives you 15-20 working years. That is longer than most people spend in their first career. And you are not starting from zero. You are starting with 25-30 years of accumulated skills, contacts, and professional judgement that no 25-year-old can match.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide addresses the realities head-on, including age discrimination, salary concerns, and retraining options, and gives you a practical roadmap.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">15-20</div>
          <div className="text-xs text-gray-500">Working years ahead</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">1 in 4</div>
          <div className="text-xs text-gray-500">Over-50s want to change career</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">36%</div>
          <div className="text-xs text-gray-500">of UK workforce is over 50</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">25-30</div>
          <div className="text-xs text-gray-500">Years of transferable skills</div>
        </div>
      </div>

      {/* CTA 1 - Style A */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">30 years of experience means hundreds of transferable skills</div>
          <div className="text-sm text-gray-500">
            Upload your CV and our AI will map every skill to new careers you qualify for right now.
          </div>
        </div>
        <Link
          href="/discover"
          className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap"
        >
          Analyse My Skills Free
        </Link>
      </div>

      {/* Section: Why 50 is not too late */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Why 50 is not too late (the evidence)
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Your experience is genuinely valuable</h3>
            <p className="text-sm text-gray-600">
              At 50, you bring something younger candidates cannot: decades of professional judgement, crisis management experience, and deep industry knowledge. McKinsey research shows that workers over 50 demonstrate stronger decision-making under uncertainty and better stakeholder management than younger colleagues. These are premium skills.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Your brain is still learning</h3>
            <p className="text-sm text-gray-600">
              Neuroplasticity research confirms that the human brain continues to form new neural connections throughout life. While processing speed may decline slightly, your capacity for strategic thinking, pattern recognition, and complex problem-solving actually improves with age. You learn differently at 50, not worse.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">The demographics are in your favour</h3>
            <p className="text-sm text-gray-600">
              Over-50s make up 36% of the UK workforce, and that percentage is rising. Smart employers know they cannot fill their roles without experienced workers. The Centre for Ageing Better found that 78% of employers recognise the value of an age-diverse workforce. The stigma is fading.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Addressing age discrimination */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Dealing with age discrimination honestly
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Age discrimination exists. Pretending it does not helps nobody. But there are practical strategies to minimise its impact and work around it.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">CV adjustments that work</h3>
            <p className="text-sm text-gray-600">
              Remove dates before 2010 from your CV. List your last 15 years of experience. Remove graduation dates. Focus on recent achievements and current skills. This is not dishonesty; it is relevance filtering.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Target age-friendly employers</h3>
            <p className="text-sm text-gray-600">
              Some employers actively value experience. B&Q, Barclays, Aviva, and the NHS have programmes for over-50s. Check if a company has signed the Age-Friendly Employer Pledge.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Demonstrate digital confidence</h3>
            <p className="text-sm text-gray-600">
              The biggest stereotype is that over-50s struggle with technology. Counter this by referencing specific tools you use (Slack, Teams, Google Workspace, project management software). A LinkedIn profile helps too.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Consider self-employment</h3>
            <p className="text-sm text-gray-600">
              Consultancy, freelancing, and portfolio careers eliminate the age bias entirely. Clients care about results, not your date of birth. Your decades of expertise become your selling point.
            </p>
          </div>
        </div>
      </section>

      {/* CTA 2 - Style B */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">Your experience is your competitive advantage</h3>
        <p className="text-gray-300 text-sm mb-4">
          Our AI does not see your age. It sees your skills, your experience, and your potential. Upload your CV and discover careers you qualify for right now.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
        >
          Get My Personalised Matches
        </Link>
      </div>

      {/* Popular career changes at 50 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Popular career changes at 50
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          These transitions leverage decades of experience rather than requiring you to start from scratch.
        </p>
        <div className="space-y-4">
          {[
            { title: "Consultant / Advisor", salary: "£40,000 - £80,000+", desc: "Package your industry expertise as consulting services. Businesses pay premium rates for experienced advisors. No employer needed." },
            { title: "Executive Coach / Mentor", salary: "£35,000 - £70,000+", desc: "Your management experience qualifies you to coach others. ICF certification takes 6 months. Growing demand as companies invest in leadership development." },
            { title: "Non-Executive Director", salary: "£10,000 - £40,000 per board seat", desc: "Join boards of smaller companies, charities, or public bodies. Your strategic experience is exactly what boards need. Multiple seats create a portfolio income." },
            { title: "Trainer / Facilitator", salary: "£30,000 - £55,000", desc: "Teach what you know. Corporate training, workshops, and adult education value real-world experience over academic credentials." },
            { title: "Project Manager", salary: "£35,000 - £65,000", desc: "If you have managed anything complex, you can manage projects. PRINCE2 certification takes 1 week. Your stakeholder skills transfer directly." },
            { title: "Property / Lettings Manager", salary: "£25,000 - £45,000", desc: "Your organisational and people skills suit property management. Can also work independently managing your own portfolio." },
            { title: "Mediator / Dispute Resolution", salary: "£30,000 - £60,000", desc: "Years of resolving workplace conflicts give you a head start. CMC-registered mediator training takes weeks, not years." },
            { title: "Charity / Non-Profit Manager", salary: "£28,000 - £50,000", desc: "Many charities actively recruit experienced professionals who want purposeful work. Your commercial skills are highly valued in the third sector." },
          ].map((job) => (
            <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
              </div>
              <p className="text-sm text-gray-600">{job.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 3 - Style C */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The average person changes careers 5-7 times in their lifetime.</span> If this is your second or third change, you are simply following a well-worn path. Upload your CV and{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
            see your personalised matches
          </Link>.
        </p>
      </div>

      {/* Practical steps */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Practical steps for changing careers at 50
        </h2>
        <div className="space-y-6">
          {[
            { step: 1, title: "Audit your financial runway", detail: "Calculate how long you can manage on savings or reduced income. Career changes at 50 are easier when you know your financial constraints. Consider whether you need to match your current salary immediately or can accept a temporary reduction." },
            { step: 2, title: "Map your transferable skills", detail: "25-30 years of work has given you skills you take for granted. Leadership, communication, problem-solving, industry knowledge, stakeholder management. Write them all down, or let our AI do it for you." },
            { step: 3, title: "Consider portfolio careers", detail: "Instead of one full-time role, combine consulting, board seats, part-time work, and freelancing. This spreads risk, uses all your skills, and gives you variety. It is increasingly common among over-50s." },
            { step: 4, title: "Upskill strategically, not broadly", detail: "You do not need a degree. A short certification in your target area is usually enough: PRINCE2 (1 week), coaching (ICF, 6 months), digital marketing (Google, free). Targeted learning, not wholesale retraining." },
            { step: 5, title: "Leverage your network", detail: "After 25+ years, your network is your most powerful asset. Tell people you are exploring new directions. Informational interviews with contacts in your target area open doors that job applications cannot." },
            { step: 6, title: "Test before you leap", detail: "Volunteer, take on a side project, or do consulting work in your target area before committing. This validates the change and builds evidence for your CV." },
          ].map((s) => (
            <div key={s.step} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <span className="text-indigo-600 mr-2">Step {s.step}.</span>{s.title}
              </h3>
              <p className="text-sm text-gray-600">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple text CTA */}
      <p className="text-gray-600 mb-10">
        Wondering what you actually qualify for?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your matches in 2 minutes &rarr;
        </Link>
      </p>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Your next chapter starts with knowing your options
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your experience. Our AI maps your decades of skills to careers you qualify for today. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Discover My Career Matches
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors"
          >
            Take the Career Quiz
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
          <span className="text-gray-300">|</span>
          <Link href="/freelance-careers-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Freelance Careers UK</Link>
          <span className="text-gray-300">|</span>
          <Link href="/how-to-write-a-cv-for-career-change" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change CV Guide</Link>
        </div>
      </div>
    </div>
  );
}
