import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Careers for the Future UK (2026-2035) | Future-Proof Jobs",
  description:
    "The most future-proof careers in the UK for 2026-2035. AI-resistant roles, growing industries, and skills that will stay in demand. Data-driven analysis with salary ranges.",
  keywords: [
    "best careers for the future UK",
    "future proof careers 2026",
    "jobs that will survive AI",
    "growing industries UK",
    "in demand careers UK",
    "careers of the future",
  ],
  openGraph: {
    title: "Best Careers for the Future UK (2026-2035)",
    description: "AI-resistant, growing careers with long-term demand. Data-driven predictions.",
    type: "article",
  },
};

export default function FutureCareersPage() {
  const careers = [
    { title: "AI / Machine Learning Engineer", salary: "£45,000 - £120,000+", growth: "57% projected growth", whyFutureProof: "AI will automate many jobs, but someone has to build, train, and maintain the AI. Demand is growing faster than supply." },
    { title: "Cybersecurity Analyst", salary: "£30,000 - £80,000", growth: "35% projected growth", whyFutureProof: "Every business is a digital business now. Cyber threats are increasing in sophistication and frequency. This field cannot be automated." },
    { title: "Data Scientist / Analyst", salary: "£30,000 - £90,000", growth: "28% projected growth", whyFutureProof: "Data-driven decision making is becoming the norm in every industry. The ability to extract insight from data is becoming as fundamental as literacy." },
    { title: "Healthcare Professional (Nurse, Physio, OT)", salary: "£27,000 - £55,000", growth: "15% projected growth", whyFutureProof: "An ageing population and rising health complexity mean sustained demand. Physical care, empathy, and clinical judgement cannot be automated." },
    { title: "Renewable Energy Engineer", salary: "£30,000 - £65,000", growth: "40% projected growth", whyFutureProof: "The UK targets net zero by 2050. Solar, wind, battery storage, and grid infrastructure need engineers. Government-backed, long-term demand." },
    { title: "UX / Product Designer", salary: "£30,000 - £75,000", growth: "22% projected growth", whyFutureProof: "As more services go digital, someone needs to make them usable. Understanding human behaviour is something AI cannot replicate." },
    { title: "Mental Health Professional", salary: "£25,000 - £60,000", growth: "25% projected growth", whyFutureProof: "Mental health awareness is rising, workplace wellbeing is becoming mandatory, and there is a chronic shortage of qualified professionals." },
    { title: "DevOps / Cloud Engineer", salary: "£40,000 - £90,000", growth: "30% projected growth", whyFutureProof: "Cloud infrastructure underpins everything digital. As businesses move to cloud, they need people to build and maintain it." },
    { title: "Sustainability / ESG Consultant", salary: "£30,000 - £70,000", growth: "33% projected growth", whyFutureProof: "ESG reporting is becoming mandatory for UK businesses. Companies need experts to navigate environmental regulations and meet targets." },
    { title: "Skilled Trades (Electrician, Plumber, Heat Pump Engineer)", salary: "£30,000 - £60,000+", growth: "20% projected growth", whyFutureProof: "The housing crisis, net zero retrofit programme, and ageing workforce guarantee demand. AI cannot rewire a house." },
    { title: "Elderly Care Specialist", salary: "£22,000 - £40,000", growth: "30% projected growth", whyFutureProof: "The UK's over-65 population will grow by 40% by 2040. Personalised, compassionate care requires human presence." },
    { title: "Biotech / Life Sciences Researcher", salary: "£28,000 - £70,000", growth: "25% projected growth", whyFutureProof: "Gene therapy, personalised medicine, and diagnostic innovation are the next frontier. The UK is a global leader in life sciences." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Careers for the Future UK (2026-2035)",
            description: "Future-proof careers in the UK with growth projections, salary data, and AI resistance analysis.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Best Careers for the Future</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Best Careers for the Future in the UK (2026-2035)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        AI is changing the job market faster than any technology since the internet. Goldman Sachs estimates that 300 million jobs globally could be affected by AI automation. But "affected" does not mean "eliminated." Many roles will be augmented, not replaced, and entirely new categories of work are emerging.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The UK has specific factors shaping its future job market: an ageing population, the net zero 2050 commitment, a chronic skills shortage worth £39 billion, and a tech sector growing 2.6x faster than the overall economy. Understanding these trends helps you position yourself correctly.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide analyses 12 career areas that will remain in demand through 2035, based on structural trends rather than hype.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£39bn</div>
          <div className="text-xs text-gray-500">UK skills gap</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">2.6x</div>
          <div className="text-xs text-gray-500">Tech growth vs economy</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">2050</div>
          <div className="text-xs text-gray-500">UK net zero target</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">40%</div>
          <div className="text-xs text-gray-500">Over-65s growth by 2040</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Are your skills future-proof?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will show you how your current skills align with future-proof careers.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Future-Proof Careers</h2>
        <div className="space-y-5">
          {careers.map((career, idx) => (
            <div key={career.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium mb-3">
                  {career.growth}
                </div>
                <p className="text-sm text-gray-600">{career.whyFutureProof}</p>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Position yourself for the next decade</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI analyses your current skills and shows you which future-proof careers you are closest to entering.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 8 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">The jobs most resistant to AI are those requiring empathy, physical presence, creative judgement, or complex human interaction.</span>{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See which future-proof roles match your skills</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI-proof skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills That AI Cannot Replace</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { skill: "Emotional intelligence", why: "Understanding, motivating, and supporting humans requires being one." },
            { skill: "Complex problem-solving", why: "Novel, ambiguous problems with no training data still require human creativity." },
            { skill: "Physical dexterity in variable environments", why: "Robots work in factories. Plumbers work in 100-year-old houses." },
            { skill: "Strategic judgement under uncertainty", why: "AI optimises for known outcomes. Leadership navigates the unknown." },
          ].map((s) => (
            <div key={s.skill} className="bg-green-50 rounded-xl p-5 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">{s.skill}</h3>
              <p className="text-sm text-gray-600">{s.why}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to future-proof your career?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see which future careers match your skills &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Invest in a career that lasts</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover which future-proof careers match your skills. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/skills-employers-want-2026" className="text-sm text-indigo-600 hover:text-indigo-700">Skills Employers Want 2026</Link>
          <span className="text-gray-300">|</span>
          <Link href="/highest-paying-remote-jobs-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Remote Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/apprenticeships-for-adults-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Adult Apprenticeships</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
        </div>
      </div>
    </div>
  );
}
