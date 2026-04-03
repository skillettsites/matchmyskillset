import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jobs That Don't Need a Degree UK (2026) | No Uni Required",
  description:
    "Careers you can start without a university degree in the UK. Tech, trades, creative, and business roles with salary data, entry routes, and skills needed.",
  keywords: [
    "jobs that don't need a degree UK",
    "careers without university",
    "no degree jobs UK",
    "jobs without qualifications",
    "careers no uni",
    "good jobs without degree UK",
  ],
  openGraph: {
    title: "Jobs That Don't Need a Degree UK (2026)",
    description: "Great careers available without university. Entry routes, salary data, and what skills actually matter.",
    type: "article",
  },
};

export default function NoDegreeJobsPage() {
  const sections = [
    {
      category: "Tech (Degree-Blind)",
      intro: "The tech industry is the most degree-blind sector in the UK. GitHub profiles, portfolios, and certifications carry more weight than a BSc.",
      jobs: [
        { title: "Software Developer", salary: "£28,000 - £70,000", route: "Coding bootcamp (12-16 weeks) or self-taught through freeCodeCamp/The Odin Project. Portfolio and practical ability matter most." },
        { title: "Cybersecurity Analyst", salary: "£28,000 - £60,000", route: "CompTIA Security+ certification, then TryHackMe for practical skills. SOC analyst apprenticeships available." },
        { title: "Cloud Engineer", salary: "£35,000 - £70,000", route: "AWS Cloud Practitioner, then Solutions Architect cert. Home lab practice. IT support experience is a common starting point." },
        { title: "Digital Marketing Manager", salary: "£26,000 - £50,000", route: "Google Ads, Analytics, and HubSpot certifications (all free). Build experience through freelance work or personal projects." },
        { title: "Data Analyst", salary: "£25,000 - £50,000", route: "Google Data Analytics Certificate (6 months part-time). SQL, Excel, and Python are the actual requirements." },
      ],
    },
    {
      category: "Trades (Earn While You Learn)",
      intro: "With a £39 billion UK skills gap in trades, these careers offer excellent pay, job security, and the option of self-employment.",
      jobs: [
        { title: "Electrician", salary: "£30,000 - £55,000+", route: "Level 3 NVQ via apprenticeship (3-4 years). Self-employed electricians earn significantly more." },
        { title: "Plumber", salary: "£28,000 - £50,000+", route: "Level 2-3 NVQ. Gas Safe registration for boiler work. Apprenticeships widely available." },
        { title: "HGV Driver", salary: "£30,000 - £55,000", route: "Category C/C+E licence + Driver CPC. Training takes 2-4 weeks from a car licence." },
        { title: "Scaffolder", salary: "£30,000 - £55,000", route: "CISRS training scheme. No prior qualifications needed. Physical fitness is the main requirement." },
      ],
    },
    {
      category: "Business & Sales",
      intro: "Sales-driven careers reward results over qualifications. Your ability to communicate, persuade, and build relationships is what counts.",
      jobs: [
        { title: "Recruitment Consultant", salary: "£22,000 - £60,000+ (OTE)", route: "Direct application to agencies. Most train on the job. Resilience matters more than a CV." },
        { title: "Business Development Manager", salary: "£28,000 - £75,000+ (OTE)", route: "Start as SDR or junior sales. Progress through results. Track record beats qualifications." },
        { title: "Estate Agent", salary: "£20,000 - £50,000+ (OTE)", route: "Direct application. ARLA/NAEA qualifications available but not required to start." },
        { title: "Insurance Broker", salary: "£25,000 - £55,000", route: "CII Certificate in Insurance (study on the job). Many brokerages hire and train without degrees." },
      ],
    },
    {
      category: "Creative",
      intro: "Creative industries judge you on your portfolio, not your degree certificate. What you can make matters more than where you studied.",
      jobs: [
        { title: "Graphic Designer", salary: "£22,000 - £48,000", route: "Learn Adobe suite or Figma. Build a strong portfolio. Freelance platforms offer immediate opportunities." },
        { title: "Video Editor", salary: "£22,000 - £48,000", route: "Learn Premiere Pro or DaVinci Resolve. Build a YouTube portfolio. Corporate video work pays well." },
        { title: "Copywriter", salary: "£24,000 - £50,000", route: "Build a writing portfolio. Start freelancing. Pitch to agencies and businesses directly." },
        { title: "Photographer", salary: "£20,000 - £50,000+", route: "Camera, portfolio, word-of-mouth. Wedding and commercial photography pay the most." },
      ],
    },
    {
      category: "Public Sector",
      intro: "Several public sector careers offer degree-equivalent apprenticeships where you earn a salary while gaining your qualification.",
      jobs: [
        { title: "Train Driver", salary: "£45,000 - £65,000", route: "Direct application to train operating companies. Aptitude tests are key. No degree or railway experience needed." },
        { title: "Police Officer (PCDA)", salary: "£23,556 - £44,000+", route: "Police Constable Degree Apprenticeship: earn a salary while studying. No prior degree required." },
        { title: "Paramedic", salary: "£27,000 - £42,000", route: "Degree apprenticeship (3 years, earn while you learn). Or start as Emergency Care Assistant." },
        { title: "Firefighter", salary: "£24,000 - £38,000+", route: "Direct application. Physical fitness tests and aptitude assessments. Excellent pension." },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Jobs That Don't Need a Degree UK (2026)",
            description: "Careers available without a university degree with salary data and entry routes.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Jobs Without a Degree</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Jobs That Do Not Require a Degree in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        The idea that you need a degree to have a successful career is outdated and increasingly inaccurate. Google, Apple, EY, and Penguin Random House have all removed degree requirements from most roles. The UK government's own apprenticeship push recognises that university is not the only path.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Skills-based hiring is accelerating. 76% of UK employers now say they prioritise demonstrated skills over formal qualifications. The £39 billion UK skills gap is not a degree gap; it is a practical skills gap. Employers need people who can do the work, not people who can show a certificate.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        Here are 22 careers you can enter without a degree, organised by sector.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">76%</div>
          <div className="text-xs text-gray-500">Employers: skills over degrees</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£39bn</div>
          <div className="text-xs text-gray-500">UK skills gap</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">£75k+</div>
          <div className="text-xs text-gray-500">Top salary potential</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Degree or not, your skills determine your options</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI matches your actual skills to careers, regardless of qualifications.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {sections.map((section, sIdx) => (
        <section key={section.category} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.category}</h2>
          <p className="text-sm text-gray-500 mb-6">{section.intro}</p>
          <div className="space-y-4">
            {section.jobs.map((job) => (
              <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <p className="text-sm text-gray-600">{job.route}</p>
              </div>
            ))}
          </div>

          {sIdx === 1 && (
            <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-8">
              <h3 className="text-lg font-semibold mb-2">Skills matter more than certificates</h3>
              <p className="text-gray-300 text-sm mb-4">Our AI does not filter by qualifications. It maps your actual abilities to careers where you can succeed.</p>
              <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Get My Personalised Matches
              </Link>
            </div>
          )}

          {sIdx === 3 && (
            <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-8">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">The average graduate leaves university with £45,000+ of debt.</span> Many of these no-degree careers pay more than the average graduate salary while avoiding that burden.{" "}
                <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your options</Link>.
              </p>
            </div>
          )}
        </section>
      ))}

      <p className="text-gray-600 mb-10">
        Ready to see what you qualify for right now?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and find out in 2 minutes &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your skills are your qualification</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover careers that match what you can do, not what certificate you hold. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs No Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/apprenticeships-for-adults-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Adult Apprenticeships</Link>
          <span className="text-gray-300">|</span>
          <Link href="/skills-employers-want-2026" className="text-sm text-indigo-600 hover:text-indigo-700">Skills Employers Want 2026</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
        </div>
      </div>
    </div>
  );
}
