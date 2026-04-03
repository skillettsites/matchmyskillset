import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "20+ High Paying Jobs Without a Degree UK (2026) | No Uni Required",
  description:
    "Discover 20+ well-paying UK jobs that do not require a university degree. Trades, tech, sales, creative, and public sector roles with salary ranges and entry routes.",
  keywords: [
    "high paying jobs without a degree UK",
    "well paid jobs no qualifications",
    "best jobs without university",
    "good paying jobs no degree",
    "careers without a degree UK",
  ],
  openGraph: {
    title: "20+ High Paying Jobs Without a Degree UK (2026)",
    description: "Well-paying careers that do not require university. Entry routes, salary data, and skills needed.",
    type: "article",
  },
};

interface NoDegreeJob {
  title: string;
  salary: string;
  category: string;
  description: string;
  entryRoute: string;
  skillsNeeded: string[];
}

const JOBS: NoDegreeJob[] = [
  // Trades
  { title: "Electrician", salary: "£30,000 - £50,000+", category: "Trades", description: "Install, maintain, and repair electrical systems in homes and commercial buildings. Self-employed electricians can earn significantly more.", entryRoute: "Level 3 NVQ Diploma in Electrotechnical Services (3-4 year apprenticeship). AM2 assessment for qualified status.", skillsNeeded: ["Problem solving", "Attention to detail", "Physical fitness", "Maths"] },
  { title: "Plumber", salary: "£28,000 - £50,000+", category: "Trades", description: "Install and maintain water, heating, and drainage systems. Emergency callouts and specialisations like gas work increase earnings.", entryRoute: "Level 2-3 NVQ in Plumbing and Heating. Gas Safe registration for boiler work. Apprenticeships available.", skillsNeeded: ["Practical skills", "Problem solving", "Customer service", "Physical fitness"] },
  { title: "Scaffolder", salary: "£30,000 - £55,000", category: "Trades", description: "Erect and dismantle scaffolding for construction projects. Experienced scaffolders running their own teams earn at the top end.", entryRoute: "CISRS training scheme. Part 1 and Part 2 scaffolder cards. No prior qualifications needed.", skillsNeeded: ["Physical fitness", "Head for heights", "Team coordination", "Safety awareness"] },
  { title: "Bricklayer", salary: "£28,000 - £48,000", category: "Trades", description: "Build and repair walls, foundations, and structures. Skilled bricklayers are in high demand due to the UK housing shortage.", entryRoute: "Level 2-3 NVQ in Trowel Occupations. Apprenticeships widely available. CSCS card needed for site work.", skillsNeeded: ["Physical stamina", "Precision", "Maths", "Teamwork"] },
  { title: "HGV Driver", salary: "£30,000 - £55,000", category: "Trades", description: "Drive heavy goods vehicles for logistics and delivery companies. The post-Brexit driver shortage has pushed salaries up significantly.", entryRoute: "Category C or C+E driving licence. Driver CPC qualification. Training takes 2-4 weeks from car licence.", skillsNeeded: ["Concentration", "Navigation", "Time management", "Safety awareness"] },
  // Tech
  { title: "Software Developer (Self-Taught)", salary: "£30,000 - £75,000", category: "Tech", description: "Build websites, apps, and software systems. The tech industry is one of the most degree-blind sectors, judging candidates on portfolios and technical ability.", entryRoute: "Coding bootcamp (12-16 weeks), self-taught through freeCodeCamp or The Odin Project, or Level 4 apprenticeship.", skillsNeeded: ["Logical thinking", "Self-motivation", "Problem solving", "Continuous learning"] },
  { title: "Cybersecurity Analyst", salary: "£30,000 - £65,000", category: "Tech", description: "Protect organisations from digital threats. The cybersecurity skills gap means employers are actively hiring people without degrees who demonstrate practical ability.", entryRoute: "CompTIA Security+ or Certified in Cybersecurity (ISC2). SOC analyst apprenticeships. TryHackMe for practical skills.", skillsNeeded: ["Analytical thinking", "Attention to detail", "Curiosity", "Technical aptitude"] },
  { title: "Data Analyst", salary: "£25,000 - £55,000", category: "Tech", description: "Analyse business data to find insights and drive decisions. SQL, Excel, and visualisation tools are the core requirements, not a degree.", entryRoute: "Google Data Analytics Certificate (6 months). Then portfolio projects and junior roles.", skillsNeeded: ["Numerical ability", "Critical thinking", "Communication", "Excel proficiency"] },
  { title: "Digital Marketing Manager", salary: "£28,000 - £55,000", category: "Tech", description: "Manage online marketing campaigns across search, social, and email. Results and certifications matter more than degrees in this field.", entryRoute: "Google Ads and Analytics certifications (free). HubSpot Academy (free). Build experience through freelance work.", skillsNeeded: ["Creativity", "Analytical thinking", "Writing", "Adaptability"] },
  { title: "Cloud Engineer", salary: "£35,000 - £70,000", category: "Tech", description: "Design and manage cloud computing infrastructure. AWS and Azure certifications are more valued than degrees by most employers.", entryRoute: "AWS Cloud Practitioner, then Solutions Architect certifications. Home lab practice. IT support experience helps.", skillsNeeded: ["Technical aptitude", "Problem solving", "Automation mindset", "Self-learning"] },
  // Sales
  { title: "Recruitment Consultant", salary: "£22,000 - £60,000+ (OTE)", category: "Sales", description: "Match candidates to jobs and earn commission on placements. Top billers in specialist sectors earn six figures. No degree required or expected.", entryRoute: "Direct application to recruitment agencies. Most train on the job. Resilience matters more than qualifications.", skillsNeeded: ["Persuasion", "Resilience", "Relationship building", "Target management"] },
  { title: "Estate Agent", salary: "£20,000 - £50,000+ (OTE)", category: "Sales", description: "Help people buy, sell, and rent property. Commission structures mean your earnings reflect your effort, not your education.", entryRoute: "Direct application. ARLA or NAEA qualifications helpful but not required to start. Most learn on the job.", skillsNeeded: ["Sales ability", "Local knowledge", "Negotiation", "Customer service"] },
  { title: "Business Development Manager", salary: "£28,000 - £80,000+ (OTE)", category: "Sales", description: "Win new clients and grow revenue for businesses. Companies care about your track record of closing deals, not where you went to university.", entryRoute: "Start in junior sales or account management. Progress through results. SDR roles are common entry points.", skillsNeeded: ["Negotiation", "Relationship building", "Strategic thinking", "Resilience"] },
  { title: "Insurance Broker", salary: "£25,000 - £60,000+", category: "Sales", description: "Advise clients on insurance products and negotiate policies on their behalf. Specialist brokers in commercial or Lloyd's market earn significantly more.", entryRoute: "CII Certificate in Insurance (can be studied on the job). Many brokerages hire without degrees.", skillsNeeded: ["Analytical thinking", "Client management", "Negotiation", "Attention to detail"] },
  // Creative
  { title: "Freelance Copywriter", salary: "£25,000 - £60,000+", category: "Creative", description: "Write persuasive content for businesses. Websites, emails, ads, and social media. Your portfolio and results prove your ability, not a certificate.", entryRoute: "Build a portfolio writing for free or cheap. Use Fiverr or Upwork to build client history. Then pitch directly.", skillsNeeded: ["Writing ability", "Persuasion", "Research", "Self-discipline"] },
  { title: "Video Editor / Videographer", salary: "£22,000 - £50,000", category: "Creative", description: "Create video content for brands, agencies, and social media. Every business needs video now, and the demand outstrips the supply of skilled editors.", entryRoute: "Learn Premiere Pro or DaVinci Resolve. Build a YouTube channel or create spec work. No formal qualification needed.", skillsNeeded: ["Visual creativity", "Technical skills", "Storytelling", "Patience"] },
  { title: "Photographer", salary: "£20,000 - £50,000+", category: "Creative", description: "Commercial, wedding, product, or event photography. Self-employed photographers who build strong brands earn well above average.", entryRoute: "Practice, portfolio, and word-of-mouth. Second-shoot for established photographers to build experience.", skillsNeeded: ["Visual eye", "Technical camera skills", "Client management", "Editing skills"] },
  // Public Sector
  { title: "Police Officer", salary: "£23,556 - £44,000+", category: "Public Sector", description: "Protect communities and enforce the law. Despite the 2020 degree requirement for new recruits, the Police Constable Degree Apprenticeship (PCDA) means you earn while you learn.", entryRoute: "PCDA route: earn a salary while studying for a degree. No prior degree required to apply.", skillsNeeded: ["Physical fitness", "Communication", "Decision making", "Resilience"] },
  { title: "Firefighter", salary: "£24,000 - £38,000+", category: "Public Sector", description: "Respond to fires, road accidents, and other emergencies. Regular shifts, strong team culture, and excellent pension. Highly competitive to join.", entryRoute: "Direct application to fire services. No degree required. Physical fitness tests and aptitude assessments.", skillsNeeded: ["Physical fitness", "Teamwork", "Quick thinking", "Mechanical aptitude"] },
  { title: "Train Driver", salary: "£45,000 - £65,000", category: "Public Sector", description: "One of the best-paid roles available without a degree. Regular hours, strong union protection, and excellent benefits. Waiting lists can be long.", entryRoute: "Direct application to train operating companies. No degree or prior railway experience required. Aptitude tests are key.", skillsNeeded: ["Concentration", "Safety awareness", "Calm under pressure", "Reliability"] },
  { title: "Paramedic", salary: "£27,000 - £42,000", category: "Public Sector", description: "Provide emergency medical care. The paramedic degree apprenticeship allows you to train on the job without paying tuition fees.", entryRoute: "Paramedic degree apprenticeship (3 years, earn while you learn). Or start as Emergency Care Assistant then convert.", skillsNeeded: ["Calm under pressure", "Empathy", "Physical fitness", "Quick decision making"] },
];

const CATEGORIES = ["Trades", "Tech", "Sales", "Creative", "Public Sector"] as const;

export default function HighPayingNoDegree() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "20+ High Paying Jobs Without a Degree UK (2026)",
            description: "Well-paying UK careers that do not require a university degree, with salary ranges and entry routes.",
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
        {" / "}<span className="text-gray-600">High Paying Jobs Without a Degree</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        20+ High Paying Jobs Without a Degree in the UK
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        University is not the only path to a well-paying career. In fact, some of the UK's best-paid professionals never set foot in a lecture hall. With the average graduate leaving university with over £45,000 of student debt, and starting salaries often below £25,000, the financial case for a degree is weaker than ever.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The UK has a critical shortage of skilled tradespeople, tech talent, and salespeople. Employers in these sectors care about what you can do, not where you studied. According to UCAS data, the proportion of young people choosing apprenticeships over university has increased by 12% since 2022.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        Here are 20+ careers where you can earn £30,000 or more without a university degree, organised by sector.
      </p>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£45k+</div>
          <div className="text-xs text-gray-500">Avg graduate debt</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">21</div>
          <div className="text-xs text-gray-500">Careers listed here</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">£75k+</div>
          <div className="text-xs text-gray-500">Top salary potential</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">12%</div>
          <div className="text-xs text-gray-500">Rise in apprenticeships</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Not sure which path is right for you?</div>
          <div className="text-sm text-gray-500">Our AI analyses your existing skills and matches you to careers, no degree or CV formatting required.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Jump to a sector</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase().replace(/ /g, "-")}`}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      {CATEGORIES.map((category, catIdx) => {
        const categoryJobs = JOBS.filter((j) => j.category === category);
        return (
          <section key={category} id={category.toLowerCase().replace(/ /g, "-")} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category}
            </h2>
            <div className="space-y-5">
              {categoryJobs.map((job) => (
                <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-indigo-600">How to get in</span>
                    <p className="text-sm text-gray-600 mt-1">{job.entryRoute}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.skillsNeeded.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                  <Link
                    href={`/jobs?q=${encodeURIComponent(job.title)}`}
                    className="inline-block text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Search {job.title} jobs
                  </Link>
                </div>
              ))}
            </div>

            {/* Inline CTAs */}
            {catIdx === 1 && (
              <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-8">
                <h3 className="text-lg font-semibold mb-2">You already have skills employers want</h3>
                <p className="text-gray-300 text-sm mb-4">Even without a degree, your life and work experience has built real, transferable skills. Our AI finds them and matches you to careers.</p>
                <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Discover My Hidden Skills
                </Link>
              </div>
            )}
            {catIdx === 3 && (
              <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-8">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Transferable skills matter more than qualifications.</span> Research shows that 76% of UK employers now prioritise skills over degrees when hiring. Upload your CV and{" "}
                  <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">see what you already qualify for</Link>.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Apprenticeship Info */}
      <section className="bg-amber-50 rounded-xl p-6 sm:p-8 mb-12 border border-amber-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">The Apprenticeship Route</h2>
        <p className="text-sm text-gray-700 mb-3">
          Apprenticeships let you earn while you learn, with no tuition fees and no student debt. The UK government funds most apprenticeship training costs through the Apprenticeship Levy. Entry requirements vary, but many require just GCSEs in English and Maths.
        </p>
        <p className="text-sm text-gray-700 mb-3">
          Level 4-7 apprenticeships (degree equivalent) are available in software development, data analysis, cybersecurity, project management, and many other fields. You get the same qualification as a university graduate, plus 3-4 years of workplace experience.
        </p>
        <p className="text-sm text-gray-700">
          Search apprenticeships at <span className="font-medium">gov.uk/apply-apprenticeship</span>.
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Find high-paying careers that match your skills
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Degree or no degree, your skills determine your options. Upload your CV or describe your experience and discover what you qualify for today.
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

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/highest-paying-careers-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Careers UK</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-no-experience" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Experience</Link>
          <span className="text-gray-300">|</span>
          <Link href="/what-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">What Jobs Can I Get</Link>
          <span className="text-gray-300">|</span>
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
        </div>
      </div>
    </div>
  );
}
