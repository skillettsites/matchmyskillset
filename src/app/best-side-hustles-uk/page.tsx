import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "25 Best Side Hustles UK (2026) | Earn Extra Money",
  description:
    "25 genuine side hustles you can start in the UK in 2026. From freelancing to reselling, with realistic income estimates and honest time commitments. No get-rich-quick nonsense.",
  keywords: [
    "best side hustles UK 2026",
    "side jobs to make extra money",
    "UK side income ideas",
    "part time income UK",
    "make extra money UK",
    "side hustle ideas",
  ],
  openGraph: {
    title: "25 Best Side Hustles UK (2026)",
    description: "Genuine side income ideas with realistic earnings. No scams, just real opportunities.",
    type: "article",
  },
};

interface SideHustle {
  title: string;
  income: string;
  timeNeeded: string;
  startupCost: string;
  category: string;
  description: string;
  howToStart: string;
}

const HUSTLES: SideHustle[] = [
  { title: "Freelance Writing", income: "£200 - £3,000/month", timeNeeded: "5-20 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Write blog posts, website copy, or social media content for businesses. The UK content marketing industry is worth £7.2bn and growing.", howToStart: "Write 3 sample pieces. List on Upwork or PeoplePerHour. Pitch to small businesses directly via LinkedIn." },
  { title: "Online Tutoring", income: "£300 - £2,000/month", timeNeeded: "5-15 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Teach subjects you know via video call. English, maths, and sciences are always in demand. International students pay premium rates for English tuition.", howToStart: "Register on Tutorful or MyTutor. Set your hourly rate. Build reviews through consistent quality." },
  { title: "eBay / Vinted Reselling", income: "£100 - £2,000/month", timeNeeded: "5-15 hrs/week", startupCost: "£50 - £200", category: "Reselling", description: "Buy items cheaply from car boots, charity shops, and clearance sales, then resell online. Clothing, electronics, and vintage items perform well.", howToStart: "Start with items from your own home. Learn which categories sell fast. Reinvest profits into stock." },
  { title: "Amazon FBA", income: "£200 - £5,000+/month", timeNeeded: "10-20 hrs/week", startupCost: "£500 - £2,000", category: "Reselling", description: "Source products (wholesale or own brand) and send them to Amazon's warehouse. They handle storage, shipping, and customer service.", howToStart: "Research products using Jungle Scout or Helium 10. Start with wholesale arbitrage before own-brand products." },
  { title: "Delivery Driving", income: "£300 - £1,500/month", timeNeeded: "10-20 hrs/week", startupCost: "Vehicle costs", category: "Gig Economy", description: "Deliver for Amazon Flex, Deliveroo, or DPD on your own schedule. Evenings and weekends pay the most.", howToStart: "Sign up on the platform of your choice. Approval takes 1-2 weeks. Start with a few hours to test earnings." },
  { title: "Web Design (Freelance)", income: "£500 - £5,000/month", timeNeeded: "10-20 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Build websites for small businesses using WordPress, Squarespace, or Shopify. Every local business needs a website, and most have a bad one.", howToStart: "Learn WordPress or Webflow. Build 3 demo sites. Offer services to local businesses. Charge £500-2,000 per site." },
  { title: "Social Media Management", income: "£300 - £2,500/month", timeNeeded: "5-15 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Manage social accounts for small businesses who do not have time to do it themselves. Content creation, scheduling, and engagement.", howToStart: "Manage your own accounts well first. Offer to run one business's social for free. Build case studies." },
  { title: "Dog Walking / Pet Sitting", income: "£200 - £1,500/month", timeNeeded: "5-20 hrs/week", startupCost: "Free", category: "Gig Economy", description: "Walk dogs or look after pets while owners are at work or on holiday. Flexible hours that suit other commitments.", howToStart: "Register on Rover or Tailster. Get DBS checked. Start with neighbours and build reviews." },
  { title: "Etsy Crafts / Print-on-Demand", income: "£100 - £2,000/month", timeNeeded: "10-20 hrs/week", startupCost: "£50 - £200", category: "Creative", description: "Sell handmade crafts, digital downloads, or print-on-demand products on Etsy. Digital products (SVGs, planners, templates) have zero marginal cost.", howToStart: "Research what sells on Etsy in your niche. Create 20+ listings. Use Etsy ads initially to gain traction." },
  { title: "Bookkeeping", income: "£300 - £2,000/month", timeNeeded: "5-15 hrs/week", startupCost: "£200 (qualification)", category: "Skill-Based", description: "Manage financial records for small businesses using cloud software. Steady, recurring monthly income from each client.", howToStart: "Get IAB or ICB bookkeeping qualification. Register as Xero/QuickBooks partner. Market to local small businesses." },
  { title: "Photography", income: "£200 - £3,000/month", timeNeeded: "5-15 hrs/week", startupCost: "£500+ (camera)", category: "Creative", description: "Event photography, product shots for e-commerce, or stock photography. Weddings pay the most but require weekend availability.", howToStart: "Invest in decent equipment. Build a portfolio. List on Google Business. Network with wedding venues and businesses." },
  { title: "Property Sourcing", income: "£1,000 - £5,000 per deal", timeNeeded: "10-20 hrs/week", startupCost: "Free", category: "Investment", description: "Find below-market-value properties for investors and earn a sourcing fee. Requires property knowledge and networking but no capital.", howToStart: "Learn property investment basics. Network at local property meetups. Build relationships with estate agents." },
  { title: "Matched Betting", income: "£200 - £1,000/month", timeNeeded: "5-10 hrs/week", startupCost: "£50 - £200 float", category: "Investment", description: "Use bookmaker free bet offers to generate risk-free profit. Mathematical, not gambling. Income reduces after initial sign-up offers.", howToStart: "Use OddsMonkey or Profit Accumulator for step-by-step guidance. Start with small stakes to learn the process." },
  { title: "Virtual Assistant", income: "£200 - £1,500/month", timeNeeded: "5-15 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Provide remote admin support to busy professionals and small businesses. Diary management, email, research, and basic tasks.", howToStart: "Register on Time Etc or Virtalent. Or pitch directly to entrepreneurs on LinkedIn." },
  { title: "Graphic Design", income: "£300 - £3,000/month", timeNeeded: "5-20 hrs/week", startupCost: "Free (Canva)", category: "Creative", description: "Create logos, social media graphics, and marketing materials for businesses. Canva makes professional design accessible to beginners.", howToStart: "Learn Canva Pro or Adobe suite. Build a portfolio on Behance. Offer services on Fiverr or directly to businesses." },
  { title: "Car Cleaning / Valeting", income: "£400 - £2,000/month", timeNeeded: "10-20 hrs/week", startupCost: "£200 - £500", category: "Gig Economy", description: "Mobile car valeting is a cash-generating side hustle with low overheads and repeat customers. Premium detailing pays significantly more.", howToStart: "Buy basic supplies. Offer to friends and neighbours. List on local Facebook groups. Build word-of-mouth." },
  { title: "Renting Out a Room", income: "£400 - £800/month", timeNeeded: "1-2 hrs/week", startupCost: "Free", category: "Passive", description: "The UK Rent a Room scheme lets you earn up to £7,500/year tax-free by renting a furnished room in your home. Passive income with minimal effort.", howToStart: "List on SpareRoom or Airbnb. Set house rules. Screen potential tenants carefully." },
  { title: "Affiliate Marketing", income: "£0 - £5,000+/month", timeNeeded: "10-20 hrs/week", startupCost: "£50 - £100/year", category: "Passive", description: "Build a niche website or social following that earns commission by recommending products. Takes months to build but generates passive income.", howToStart: "Choose a niche you know. Build a WordPress site. Write helpful content. Join Amazon Associates and relevant affiliate programmes." },
  { title: "Translation", income: "£300 - £2,000/month", timeNeeded: "5-15 hrs/week", startupCost: "Free", category: "Skill-Based", description: "Translate documents, websites, or subtitles between languages. Bilingual speakers are in high demand. Specialist translators (legal, medical) earn the most.", howToStart: "Register on ProZ, TranslatorsCafe, or Upwork. Take the ITI or CIOL assessment for credibility." },
  { title: "Cleaning Services", income: "£400 - £2,000/month", timeNeeded: "10-20 hrs/week", startupCost: "£100", category: "Gig Economy", description: "Domestic or commercial cleaning. Low barrier to entry, steady demand, and repeat customers. End-of-tenancy cleans and Airbnb turnovers pay premium rates.", howToStart: "Register on Bark or Checkatrade. Build word-of-mouth locally. Offer a consistently high standard." },
];

const CATEGORIES = ["Skill-Based", "Reselling", "Creative", "Gig Economy", "Investment", "Passive"] as const;

export default function SideHustlesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "25 Best Side Hustles UK (2026)",
            description: "Genuine side hustles with realistic income estimates and honest time commitments.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Best Side Hustles UK</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        25 Best Side Hustles in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>14 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        The cost of living crisis has made side income essential for millions of UK households. But most "side hustle" articles are filled with vague promises and unrealistic income claims. This guide is different: every hustle listed here includes honest income estimates, the real time commitment, and startup costs.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        Some of these can become full-time businesses. Others are pure supplementary income. We have categorised them so you can find the right fit for your skills, time, and budget.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">43%</div>
          <div className="text-xs text-gray-500">of UK workers have a side hustle</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£1,100</div>
          <div className="text-xs text-gray-500">Avg monthly side income</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">£1,000</div>
          <div className="text-xs text-gray-500">Tax-free trading allowance</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Thinking bigger than a side hustle?</div>
          <div className="text-sm text-gray-500">If your side hustle ambition is really a career change in disguise, our AI can match your skills to full-time careers you would enjoy.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Jump to a category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <a key={cat} href={`#${cat.toLowerCase().replace(/-/g, "")}`} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Listings by Category */}
      {CATEGORIES.map((category, catIdx) => {
        const catHustles = HUSTLES.filter((h) => h.category === category);
        if (catHustles.length === 0) return null;
        return (
          <section key={category} id={category.toLowerCase().replace(/-/g, "")} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
            <div className="space-y-5">
              {catHustles.map((h) => (
                <div key={h.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{h.title}</h3>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{h.income}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{h.timeNeeded}</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-medium">Startup: {h.startupCost}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{h.description}</p>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">How to start</span>
                    <p className="text-sm text-gray-600 mt-1">{h.howToStart}</p>
                  </div>
                </div>
              ))}
            </div>

            {catIdx === 0 && (
              <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-8">
                <h3 className="text-lg font-semibold mb-2">Could your side hustle become your main career?</h3>
                <p className="text-gray-300 text-sm mb-4">Many successful career changes start as side projects. Our AI identifies your strongest skills and matches them to full-time careers.</p>
                <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Get My Personalised Matches
                </Link>
              </div>
            )}
            {catIdx === 2 && (
              <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-8">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">33% of UK workers want to change careers entirely.</span> If your side hustle is a signal that you want something different from your day job, that is worth exploring.{" "}
                  <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Discover your career matches</Link>.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Tax Note */}
      <section className="bg-amber-50 rounded-xl p-6 mb-10 border border-amber-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Tax: What You Need to Know</h2>
        <p className="text-sm text-gray-700 mb-2">The UK trading allowance gives you £1,000 of tax-free income from side hustles. Above that, you must register as self-employed with HMRC and file a self-assessment tax return.</p>
        <p className="text-sm text-gray-700">Track your income and expenses from day one. Use free tools like Wave or QuickBooks Self-Employed. Set aside 20-30% of profits for tax.</p>
      </section>

      {/* Simple text CTA */}
      <p className="text-gray-600 mb-10">
        Looking for a full-time career change instead?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          See which careers match your skills &rarr;
        </Link>
      </p>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Find your perfect side hustle or career</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV or describe your skills and discover opportunities that match what you are good at. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/freelance-careers-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Freelance Careers UK</Link>
          <span className="text-gray-300">|</span>
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-you-can-do-from-home-with-no-experience" className="text-sm text-indigo-600 hover:text-indigo-700">WFH Jobs No Experience</Link>
          <span className="text-gray-300">|</span>
          <Link href="/highest-paying-remote-jobs-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Remote Jobs</Link>
        </div>
      </div>
    </div>
  );
}
