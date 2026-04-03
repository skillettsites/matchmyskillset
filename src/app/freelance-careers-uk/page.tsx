import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Freelance Careers UK (2026) | How to Go Freelance",
  description:
    "The best freelance careers in the UK for 2026. Realistic income expectations, how to find clients, tax basics, and which skills are most in demand. Practical guide.",
  keywords: [
    "best freelance careers UK",
    "how to go freelance",
    "freelance jobs UK 2026",
    "self employed careers",
    "freelancing UK guide",
    "freelance income UK",
  ],
  openGraph: {
    title: "Best Freelance Careers UK (2026)",
    description: "Practical guide to freelancing in the UK. Best careers, income expectations, and how to start.",
    type: "article",
  },
};

export default function FreelanceCareersPage() {
  const careers = [
    { title: "Web Developer / Designer", income: "£300 - £800/day", demand: "Very High", description: "Every business needs a website. Most have a bad one. Freelance web developers who can design, build, and launch a professional site charge £1,000-5,000+ per project.", getStarted: "Learn React/Next.js or WordPress. Build 3 demo sites. Offer services to local businesses. Word-of-mouth builds quickly." },
    { title: "Copywriter", income: "£200 - £600/day", demand: "High", description: "Write website copy, email campaigns, social media content, and sales pages. Specialist copywriters (financial, medical, SaaS) earn the most.", getStarted: "Write 5 sample pieces. List on PeoplePerHour or Upwork. Pitch businesses directly via LinkedIn. Niching increases rates." },
    { title: "Graphic Designer", income: "£200 - £500/day", demand: "High", description: "Logos, brand identities, marketing materials, and social media graphics. Strong portfolio matters more than any qualification.", getStarted: "Master Adobe suite or Figma. Build a portfolio on Behance. Start on Fiverr to build reviews, then move to direct clients." },
    { title: "Management Consultant", income: "£500 - £1,500/day", demand: "High", description: "Package your industry expertise as advisory services. Mid-career and senior professionals command premium day rates.", getStarted: "Define your niche expertise. Build a LinkedIn presence. Network through your existing contacts. Start with a few anchor clients." },
    { title: "Bookkeeper / Accountant", income: "£150 - £400/day", demand: "Very High", description: "Recurring monthly income from multiple clients. Cloud accounting makes it fully remote. Small businesses need this service but cannot afford full-time staff.", getStarted: "IAB/ICB qualification. Xero/QuickBooks partner certification. Market to local small businesses and sole traders." },
    { title: "SEO Specialist", income: "£250 - £600/day", demand: "High", description: "Help businesses rank in Google. Retainer-based work (£500-2,000/month per client) provides predictable income. Technical SEO specialists command the highest rates.", getStarted: "Learn through practical experience (optimise your own site). Google certifications. Ahrefs/SEMrush competency. Build case studies." },
    { title: "Video Editor / Videographer", income: "£200 - £500/day", demand: "Growing", description: "Every brand needs video content for social media, YouTube, and websites. Event videography, corporate videos, and social content editing are all in demand.", getStarted: "Learn Premiere Pro or DaVinci Resolve. Build a showreel. Approach agencies and businesses directly." },
    { title: "Virtual Assistant", income: "£15 - £30/hour", demand: "Very High", description: "Remote admin support for busy professionals. Low barrier to entry, steady demand, and the ability to scale by hiring other VAs.", getStarted: "Register on Time Etc or Virtalent. Or pitch directly to entrepreneurs on LinkedIn. Specialise for higher rates." },
    { title: "Translator", income: "£150 - £400/day", demand: "Medium-High", description: "Translate documents, websites, or subtitles. Bilingual speakers are always in demand. Legal and medical translation pay the most.", getStarted: "Register on ProZ and TranslatorsCafe. CIOL or ITI membership adds credibility. Build a specialist niche." },
    { title: "Photographer", income: "£200 - £600/day", demand: "Medium", description: "Corporate headshots, product photography, events, and weddings. Specialisation is key: food photographers, property photographers, and brand photographers all have distinct markets.", getStarted: "Build a niche portfolio. Google Business listing. Network with venues and agencies. Consistent quality builds referrals." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Freelance Careers UK (2026)",
            description: "Practical guide to freelancing with best careers, income expectations, and how to start.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Freelance Careers UK</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Best Freelance Careers in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        There are 4.4 million self-employed people in the UK, and the number is growing. Freelancing offers something no employment contract can: complete control over your time, clients, and income. The trade-off is that nobody pays you when you are ill, on holiday, or between clients.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers the most viable freelance careers, realistic income expectations, how to find clients, and the practical steps to go from employed to self-employed without financial disaster.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">4.4m</div>
          <div className="text-xs text-gray-500">Self-employed in the UK</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£1,500</div>
          <div className="text-xs text-gray-500">Top freelance day rates</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">£1,000</div>
          <div className="text-xs text-gray-500">Tax-free trading allowance</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Which freelance career suits your skills?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will identify which of your skills are most valuable on the freelance market.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">10 Best Freelance Careers</h2>
        <div className="space-y-5">
          {careers.map((career, idx) => (
            <div key={career.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.income}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                  Demand: {career.demand}
                </div>
                <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                <div>
                  <span className="text-xs font-semibold text-gray-500">How to get started</span>
                  <p className="text-sm text-gray-600 mt-1">{career.getStarted}</p>
                </div>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Your employed skills are freelance-ready</h3>
                  <p className="text-gray-300 text-sm mb-4">The skills you use in employment are often more valuable when sold directly. Our AI shows you which of your skills command the highest freelance rates.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 7 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">The average freelancer earns 22% more than their employed equivalent</span> (IPSE data), though this varies significantly by sector and experience level.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your freelance potential</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tax and Practical */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Freelancing Practicalities</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Tax basics</h3>
            <p className="text-sm text-gray-600">Register as self-employed with HMRC. You get a £1,000 trading allowance, then a £12,570 personal allowance. Set aside 25-30% of income for tax and NI. Use an accountant (worth every penny).</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Finding clients</h3>
            <p className="text-sm text-gray-600">Start with your existing network. LinkedIn is your best marketing tool. Freelance platforms (Upwork, PeoplePerHour) for initial momentum. Referrals become your primary source within 12 months.</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Financial buffer</h3>
            <p className="text-sm text-gray-600">Save 3-6 months of expenses before going full-time freelance. Or start freelancing alongside employment. Many successful freelancers began as side projects.</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-2">Insurance</h3>
            <p className="text-sm text-gray-600">Professional indemnity insurance is essential for most freelancers. Public liability too if you visit client sites. Income protection insurance replaces sick pay.</p>
          </div>
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to explore freelancing?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your freelance career matches &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Discover your freelance potential</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and find out which of your skills are most valuable on the freelance market. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/best-side-hustles-uk" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Side Hustles UK</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/best-side-hustles-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Best Side Hustles UK</Link>
          <span className="text-gray-300">|</span>
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/highest-paying-remote-jobs-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Remote Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
        </div>
      </div>
    </div>
  );
}
