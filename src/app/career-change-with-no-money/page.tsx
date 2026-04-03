import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change With No Money (2026) | Free Routes to a New Career",
  description:
    "How to change career when you have no savings. Free training, no-cost transition strategies, and careers you can switch to without spending money. Practical UK guide.",
  keywords: [
    "career change with no savings",
    "how to change career when you can't afford to",
    "free career change UK",
    "career change no money",
    "change career on a budget",
    "free retraining UK",
  ],
  openGraph: {
    title: "Career Change With No Money (2026 Guide)",
    description: "Practical strategies for changing careers when you cannot afford to. Free training routes and zero-cost transitions.",
    type: "article",
  },
};

export default function CareerChangeNoMoneyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Career Change With No Money (2026 Guide)",
            description: "How to change career with no savings using free training and zero-cost strategies.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Career Change With No Money</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        How to Change Career When You Cannot Afford To
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        The biggest barrier to career change is not skills, confidence, or age. It is money. "I cannot afford to retrain" and "I cannot afford a pay cut while I transition" are the two most common reasons people stay in careers they hate. Both are valid concerns. Neither is insurmountable.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        This guide is for people with no savings, no financial safety net, and no ability to quit their job and study full-time. Every strategy here costs nothing or close to nothing, and every transition can be done alongside your current job.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        The core principle: change career by leveraging skills you already have, not by paying for skills you do not.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£0</div>
          <div className="text-xs text-gray-500">Cost of many transitions</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">76%</div>
          <div className="text-xs text-gray-500">Employers: skills over degrees</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">100+</div>
          <div className="text-xs text-gray-500">Free certifications available</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">The first step costs nothing</div>
          <div className="text-sm text-gray-500">Upload your CV and discover which careers your existing skills qualify you for. Free. 2 minutes. No credit card.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Strategy 1: Zero-cost transitions */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 1: Switch without retraining</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Many career changes do not require new qualifications at all. They just require reframing your existing skills for a different audience. These transitions cost zero:
        </p>
        <div className="space-y-4">
          {[
            { from: "Teacher", to: "L&D Manager, Corporate Trainer", cost: "£0", timeframe: "1-3 months" },
            { from: "Retail Manager", to: "Recruitment Consultant, Customer Success", cost: "£0", timeframe: "Immediate" },
            { from: "Admin/Office Worker", to: "Project Coordinator, Executive Assistant", cost: "£0", timeframe: "1-2 months" },
            { from: "Customer Service", to: "Account Manager, Sales", cost: "£0", timeframe: "Immediate" },
            { from: "Any manager", to: "Operations Manager in a different industry", cost: "£0", timeframe: "1-3 months" },
          ].map((t) => (
            <div key={t.from} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{t.from}</span>
                  <span className="text-gray-400">&rarr;</span>
                  <span className="text-sm font-semibold text-indigo-600">{t.to}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs text-green-600 font-medium">Cost: {t.cost}</span>
                  <span className="text-xs text-gray-500">Timeframe: {t.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategy 2: Free training */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 2: Free training that leads to real careers</h2>
        <div className="space-y-4">
          {[
            { programme: "Google Career Certificates", subjects: "Data Analytics, UX Design, Project Management, Cybersecurity, IT Support, Digital Marketing", cost: "Free (with Google scholarship) or £30/month on Coursera", duration: "3-6 months", outcome: "Recognised by employers including Google itself. Portfolio of projects." },
            { programme: "HubSpot Academy", subjects: "Inbound Marketing, Content Marketing, Social Media, Email Marketing, Sales", cost: "Completely free", duration: "2-10 hours per certification", outcome: "Industry-recognised certifications. Immediate LinkedIn credibility." },
            { programme: "freeCodeCamp", subjects: "Web Development, JavaScript, Python, Data Visualisation, APIs", cost: "Completely free", duration: "Self-paced (300+ hours)", outcome: "Portfolio projects. Many freeCodeCamp alumni now work at major tech companies." },
            { programme: "Skills Bootcamps (Government)", subjects: "Digital, Technical, Green skills", cost: "Free (government funded)", duration: "Up to 16 weeks", outcome: "Fast-track to interview with employer. Guaranteed job interview." },
            { programme: "The Open University (OpenLearn)", subjects: "800+ free courses in business, tech, health, science", cost: "Completely free", duration: "Variable (2-24 hours)", outcome: "Digital badges and certificates. Build towards formal OU qualifications." },
            { programme: "AWS Cloud Practitioner", subjects: "Cloud Computing fundamentals", cost: "Free training (£100 exam fee, often waived via vouchers)", duration: "20-40 hours", outcome: "Entry point to cloud careers paying £35,000+." },
          ].map((p) => (
            <div key={p.programme} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">{p.programme}</h3>
              <p className="text-xs text-gray-500 mb-2">{p.subjects}</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-green-50 rounded p-2 text-center">
                  <div className="text-xs font-semibold text-green-700">Cost</div>
                  <div className="text-xs text-green-800">{p.cost}</div>
                </div>
                <div className="bg-indigo-50 rounded p-2 text-center">
                  <div className="text-xs font-semibold text-indigo-700">Duration</div>
                  <div className="text-xs text-indigo-800">{p.duration}</div>
                </div>
                <div className="bg-amber-50 rounded p-2 text-center">
                  <div className="text-xs font-semibold text-amber-700">Outcome</div>
                  <div className="text-xs text-amber-800">{p.outcome}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 2 */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">Lack of money is not lack of options</h3>
        <p className="text-gray-300 text-sm mb-4">Our AI matches your existing skills to careers, then shows you which free training closes any remaining gaps. The whole process is free.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Get My Personalised Matches
        </Link>
      </div>

      {/* Strategy 3: Earn while you switch */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy 3: Earn while you switch</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Apprenticeships</h3>
            <p className="text-sm text-gray-600">Earn a salary while training. No age limit. No tuition fees. Degree-level qualifications available. See our <Link href="/apprenticeships-for-adults-uk" className="text-indigo-600 font-medium hover:text-indigo-700">adult apprenticeships guide</Link>.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Internal transfers</h3>
            <p className="text-sm text-gray-600">Your current employer may have roles in different departments. Internal moves are the lowest-risk career changes: same employer, different role, no income gap.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Side-project-first approach</h3>
            <p className="text-sm text-gray-600">Start your new career as a side project alongside your day job. Freelance writing, web development, or consulting evenings and weekends until income replaces your salary.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Bridge roles</h3>
            <p className="text-sm text-gray-600">Take a role that is halfway between your current career and your target. It maintains income while moving you closer. Example: teacher to EdTech trainer to L&D manager.</p>
          </div>
        </div>
      </section>

      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The UK government spends billions on skills training that goes unused.</span> Free bootcamps, apprenticeships, and funded courses are available right now. The barrier is awareness, not money.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Start with a free skills analysis</Link>.
        </p>
      </div>

      <p className="text-gray-600 mb-10">
        No money is not no options.{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see which career changes cost nothing &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Change your career for free</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover zero-cost career transitions. Our AI finds careers your existing skills qualify you for. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/apprenticeships-for-adults-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Adult Apprenticeships</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-people-who-hate-their-job" className="text-sm text-indigo-600 hover:text-indigo-700">I Hate My Job</Link>
          <span className="text-gray-300">|</span>
          <Link href="/how-to-write-a-cv-for-career-change" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change CV Guide</Link>
        </div>
      </div>
    </div>
  );
}
