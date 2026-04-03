import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change From Retail UK (2026) | Better Jobs After Retail",
  description:
    "Leaving retail? 12 careers for people with retail experience. Your customer service, sales, and management skills transfer to higher-paying roles. UK salary data included.",
  keywords: [
    "career change from retail",
    "leaving retail UK",
    "better jobs after retail",
    "retail worker career change",
    "jobs after retail management",
    "retail transferable skills",
  ],
  openGraph: {
    title: "Career Change From Retail UK (2026)",
    description: "12 careers for people leaving retail. Higher pay, better hours, and your skills transfer.",
    type: "article",
  },
};

export default function CareerChangeFromRetailPage() {
  const careers = [
    { title: "Recruitment Consultant", salary: "£22,000 - £55,000+ (OTE)", transition: "Immediate", description: "Selling is selling, whether it is a pair of shoes or a job candidate. Retail experience gives you resilience, target management, and people skills that recruitment agencies crave.", howToGet: "Apply directly. No qualifications needed. Your ability to hit targets and handle rejection is your CV." },
    { title: "Customer Success Manager", salary: "£28,000 - £50,000", transition: "1-3 months", description: "Help business customers get value from a software product. Your instinct for customer satisfaction, upselling, and relationship management transfers directly from retail.", howToGet: "Apply to SaaS companies. Highlight your customer retention metrics, upselling experience, and complaint resolution track record." },
    { title: "Estate Agent", salary: "£20,000 - £50,000+ (OTE)", transition: "Immediate", description: "Commission-based, people-focused, and target-driven. If you enjoyed the sales side of retail, estate agency rewards the same skills with higher earning potential.", howToGet: "Direct application. No qualifications required to start. Your sales floor experience is immediately relevant." },
    { title: "Insurance Broker / Advisor", salary: "£22,000 - £45,000", transition: "2-4 months", description: "Advisory sales in a more professional environment. Your ability to understand customer needs and recommend appropriate products is the core skill.", howToGet: "CII Certificate in Insurance (study on the job). Many brokerages train from scratch and value retail customer experience." },
    { title: "Buyer / Merchandiser", salary: "£25,000 - £50,000", transition: "1-3 months", description: "Stay in retail but move to the commercial side. Your shop floor experience gives you genuine insight into what sells, what does not, and why. Buyers with frontline experience are valued.", howToGet: "Apply to retail head offices. Start as assistant buyer/merchandiser. Your product knowledge and customer insight are your advantage." },
    { title: "Events Coordinator", salary: "£22,000 - £38,000", transition: "1-2 months", description: "Organise events, conferences, and corporate functions. Retail managers already manage logistics, staffing, suppliers, and tight deadlines. Event coordination is the same skill set in a different wrapper.", howToGet: "CIM or event management qualification helps but is not essential. Start with smaller events companies or in-house corporate events teams." },
    { title: "Sales Executive (B2B)", salary: "£25,000 - £55,000+ (OTE)", transition: "1-2 months", description: "Business-to-business sales pays more than retail sales, and the core skill is identical: understanding customer needs and presenting solutions. B2B sales often includes hybrid/remote working.", howToGet: "Apply to SDR (Sales Development Representative) roles. Your face-to-face sales experience is a genuine advantage over candidates with no sales background." },
    { title: "L&D / Training Coordinator", salary: "£24,000 - £38,000", transition: "1-3 months", description: "If you trained new starters in retail, you were already doing learning and development. Corporate L&D roles pay better and value your practical training experience.", howToGet: "Highlight your training experience on your CV. CIPD Level 3 is a bonus. Apply to large organisations with dedicated L&D teams." },
    { title: "Logistics / Supply Chain Coordinator", salary: "£24,000 - £38,000", transition: "1-3 months", description: "If you managed stock, dealt with deliveries, and ensured shelves were filled on time, you already understand supply chain fundamentals. Move upstream for better pay.", howToGet: "Apply to logistics companies or distribution centres. CILT membership is helpful. Your practical stock management experience counts." },
    { title: "Bank / Building Society Advisor", salary: "£22,000 - £32,000", transition: "1-2 months", description: "Customer advisory roles in banking are essentially retail but with better hours, no physical stock, and structured progression. Your customer service skills transfer entirely.", howToGet: "Apply directly. Banks train extensively. Your retail customer experience and sales skills are valued." },
    { title: "Office / Operations Manager", salary: "£25,000 - £42,000", transition: "1-3 months", description: "Retail managers are operations managers by another name. You manage teams, rotas, budgets, customer satisfaction, stock, and targets. Office management is the same in a different environment.", howToGet: "Apply to operations or office manager roles. Your P&L awareness, team management, and operational experience translate directly." },
    { title: "Contact Centre Team Leader", salary: "£24,000 - £35,000", transition: "Immediate", description: "Lead a team of customer service advisors. Same people management skills as retail but without the physical demands. Many offer hybrid or remote working.", howToGet: "Apply directly. Your retail team leadership experience is the primary qualification. Progress to operations manager." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Career Change From Retail UK (2026)",
            description: "12 careers for people leaving retail with salary data and transition guides.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/careers-for" className="hover:text-indigo-600">Career Change</Link>
        {" / "}<span className="text-gray-600">From Retail</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Career Change From Retail: Better Jobs That Use Your Skills
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Retail workers are some of the most under-valued professionals in the UK. You manage teams, hit sales targets, handle difficult customers, manage stock worth thousands, and keep operations running on tight margins. Then you get paid £22,000 and work weekends.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The skills you built in retail are worth significantly more in other sectors. Customer service, sales ability, team management, conflict resolution, commercial awareness, and the ability to perform under pressure. Employers outside retail will pay a premium for these competencies.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers 12 careers you can move into from retail, most of which require no additional qualifications and can be started within weeks.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">3m</div>
          <div className="text-xs text-gray-500">UK retail workers</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£55k+</div>
          <div className="text-xs text-gray-500">Top salary potential</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">0</div>
          <div className="text-xs text-gray-500">New qualifications needed (most roles)</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">76%</div>
          <div className="text-xs text-gray-500">Employers value skills over degrees</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your retail skills are worth more than retail pay</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your retail experience to higher-paying careers.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Skills Translation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translating your retail skills</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Till management / cash handling", "Financial operations / reconciliation"],
              ["Visual merchandising", "Marketing / brand presentation"],
              ["Upselling", "Sales strategy / revenue growth"],
              ["Complaint handling", "Client relationship management"],
              ["Rota management", "Resource planning / workforce management"],
              ["Stock management", "Supply chain / inventory control"],
              ["Training new starters", "L&D / onboarding design"],
              ["KPI targets", "Performance management / commercial awareness"],
            ].map(([retail, corporate]) => (
              <div key={retail} className="flex items-center gap-2 py-1">
                <span className="text-gray-500">{retail}</span>
                <span className="text-gray-400">&rarr;</span>
                <span className="font-medium text-indigo-600">{corporate}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Careers After Retail</h2>
        <div className="space-y-5">
          {careers.map((career, idx) => (
            <div key={career.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                  Transition: {career.transition}
                </div>
                <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                <div>
                  <span className="text-xs font-semibold text-gray-500">How to get there</span>
                  <p className="text-sm text-gray-600 mt-1">{career.howToGet}</p>
                </div>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Retail gave you skills most graduates lack</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI identifies every transferable skill from your retail experience and matches you to roles that pay what you are actually worth.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 7 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Retail managers who move into recruitment or B2B sales typically double their income within 2 years.</span> The sales skills are identical; the commission structures are better.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your matches</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready for better pay and better hours?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your matches in 2 minutes &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your retail experience is your qualification</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover which careers value your retail skills the most. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/careers-for/retail" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Full Retail Guide</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-from-teaching" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change From Teaching</Link>
          <span className="text-gray-300">|</span>
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs No Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for/retail" className="text-sm text-indigo-600 hover:text-indigo-700">Careers for Retail Workers</Link>
        </div>
      </div>
    </div>
  );
}
