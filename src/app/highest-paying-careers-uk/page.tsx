import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "25 Highest Paying Careers in the UK (2026) | Salary Data & Entry Routes",
  description:
    "The 25 highest paying jobs in the UK for 2026 with real salary data, entry routes, and skills needed. From medicine to tech, finance to law. Find out how to get into each one.",
  keywords: [
    "highest paying jobs UK 2026",
    "best paying careers UK",
    "top salary jobs",
    "highest paying careers UK",
    "best paid jobs UK",
    "top earners UK",
  ],
  openGraph: {
    title: "25 Highest Paying Careers in the UK (2026)",
    description: "Real salary data for the UK's best-paid careers with entry routes and skills needed.",
    type: "article",
  },
};

interface HighPayJob {
  rank: number;
  title: string;
  salary: string;
  sector: string;
  description: string;
  howToGetIn: string;
  keySkills: string[];
}

const JOBS: HighPayJob[] = [
  { rank: 1, title: "Chief Executive Officer (CEO)", salary: "£80,000 - £250,000+", sector: "Leadership", description: "Lead an organisation's strategy, operations, and stakeholder relationships. Salaries vary enormously by company size, from SME to FTSE 100.", howToGetIn: "Typically 15-20+ years of progressive leadership experience. MBA helpful but not essential. Building a track record of delivering results is what matters.", keySkills: ["Strategic thinking", "Leadership", "Financial acumen", "Stakeholder management"] },
  { rank: 2, title: "Surgeon", salary: "£80,000 - £200,000+", sector: "Medical", description: "Perform surgical procedures in NHS or private practice. Consultants in private practice can earn significantly above NHS payscales.", howToGetIn: "Medical degree (5-6 years), Foundation Programme (2 years), specialty training (6-8 years). One of the longest training pathways but among the most rewarding.", keySkills: ["Manual dexterity", "Decision making", "Calm under pressure", "Continuous learning"] },
  { rank: 3, title: "Investment Banker", salary: "£60,000 - £200,000+ (total comp)", sector: "Finance", description: "Advise on mergers, acquisitions, and capital markets transactions. Bonuses can double or triple base salary at senior levels.", howToGetIn: "Top university degree (any subject), spring week or summer internship at a bulge bracket bank, then graduate scheme. Lateral hires from accounting also possible.", keySkills: ["Financial modelling", "Analytical thinking", "Communication", "Work ethic"] },
  { rank: 4, title: "Barrister (QC/KC)", salary: "£60,000 - £500,000+", sector: "Legal", description: "Represent clients in court, specialising in areas like commercial, criminal, or family law. Top King's Counsel barristers earn seven figures.", howToGetIn: "Law degree or GDL conversion, Bar Professional Training Course, pupillage (1 year). Extremely competitive at every stage.", keySkills: ["Advocacy", "Legal analysis", "Research", "Persuasion"] },
  { rank: 5, title: "Specialist Doctor (Consultant)", salary: "£90,000 - £130,000 (NHS)", sector: "Medical", description: "Senior hospital doctors who have completed specialty training. Private practice, clinical excellence awards, and additional sessions increase earnings.", howToGetIn: "Medical degree, Foundation Programme, specialty training (5-8 years depending on speciality).", keySkills: ["Clinical expertise", "Leadership", "Teaching", "Research"] },
  { rank: 6, title: "Senior Software Engineer", salary: "£60,000 - £120,000+", sector: "Technology", description: "Design and build complex software systems. FAANG companies and fintech firms pay at the top end. Remote opportunities mean UK-based engineers can access US salary levels.", howToGetIn: "Computer science degree or bootcamp, then 5-8 years of progressive engineering experience. Portfolio and technical ability matter more than credentials.", keySkills: ["Programming", "System design", "Problem solving", "Communication"] },
  { rank: 7, title: "Dentist", salary: "£50,000 - £110,000+", sector: "Medical", description: "Provide dental care through NHS or private practice. Practice owners can earn significantly more. Cosmetic dentistry is particularly lucrative.", howToGetIn: "BDS degree (5 years), Foundation Training (1 year). Practice ownership is the route to highest earnings.", keySkills: ["Manual dexterity", "Patient communication", "Attention to detail", "Business acumen"] },
  { rank: 8, title: "Data Science Director", salary: "£80,000 - £150,000", sector: "Technology", description: "Lead data science teams and strategy. Use machine learning, AI, and advanced analytics to drive business decisions at scale.", howToGetIn: "Quantitative degree (maths, statistics, physics, CS), then 8-10 years in data science with progressive leadership responsibility.", keySkills: ["Machine learning", "Statistical analysis", "Leadership", "Business strategy"] },
  { rank: 9, title: "Pilot (Commercial)", salary: "£55,000 - £150,000+", sector: "Transport", description: "Fly commercial aircraft for airlines. Captains at major airlines earn at the top end. One of the few careers where salary increases are almost guaranteed with seniority.", howToGetIn: "Integrated ATPL course (18 months, £80k-£120k) or modular route. Airline cadet programmes are more affordable but competitive.", keySkills: ["Situational awareness", "Decision making", "Communication", "Stress management"] },
  { rank: 10, title: "Management Consultant (Partner)", salary: "£100,000 - £300,000+", sector: "Consulting", description: "Senior partners at McKinsey, BCG, Bain, and Big 4 firms earn base salaries plus substantial profit-sharing. Partner track typically takes 10-15 years.", howToGetIn: "Top university, then graduate scheme at a major firm. Lateral entry possible from industry with an MBA.", keySkills: ["Problem solving", "Client management", "Presentation", "Analytical thinking"] },
  { rank: 11, title: "Actuary", salary: "£35,000 - £100,000+", sector: "Finance", description: "Use mathematics, statistics, and financial theory to assess risk for insurance and pension companies. Fully qualified actuaries are among the best-paid professionals.", howToGetIn: "Maths, statistics, or actuarial science degree, then IFoA exams (3-6 years while working). Employers fund your training.", keySkills: ["Advanced mathematics", "Statistical modelling", "Problem solving", "Communication"] },
  { rank: 12, title: "Solicitor (Commercial Law)", salary: "£45,000 - £150,000+", sector: "Legal", description: "Advise businesses on legal matters including M&A, contracts, and disputes. Magic Circle firms pay the highest salaries.", howToGetIn: "Law degree or GDL, LPC or SQE, then training contract (2 years). Magic Circle training salaries start at £50k+.", keySkills: ["Legal analysis", "Client management", "Attention to detail", "Commercial awareness"] },
  { rank: 13, title: "Product Director", salary: "£80,000 - £150,000", sector: "Technology", description: "Define product strategy and roadmap for tech companies. Combine technical understanding with business strategy and customer insight.", howToGetIn: "5-10 years in product management, with a track record of launching successful products. No specific degree required.", keySkills: ["Strategic thinking", "Data analysis", "Stakeholder management", "Technical understanding"] },
  { rank: 14, title: "Cybersecurity Director", salary: "£80,000 - £140,000", sector: "Technology", description: "Lead an organisation's cybersecurity strategy and team. CISO roles at large companies command the highest salaries. Massive skills shortage means high demand.", howToGetIn: "8-15 years in cybersecurity with progressive responsibility. CISSP certification. Can enter cybersecurity from IT support without a degree.", keySkills: ["Risk management", "Technical security", "Leadership", "Incident response"] },
  { rank: 15, title: "Petroleum Engineer", salary: "£45,000 - £100,000+", sector: "Engineering", description: "Design and implement methods for extracting oil and gas. Increasingly pivoting to renewable energy engineering. Offshore roles pay premiums.", howToGetIn: "Engineering degree (mechanical, chemical, or petroleum). Graduate scheme with a major energy company.", keySkills: ["Engineering analysis", "Problem solving", "Health & safety", "Project management"] },
  { rank: 16, title: "Orthodontist", salary: "£60,000 - £120,000+", sector: "Medical", description: "Specialist dentist focusing on teeth alignment. Private orthodontic practices, especially Invisalign-focused, are highly profitable.", howToGetIn: "BDS degree, then 3-year specialty training in orthodontics. Competitive specialty training places.", keySkills: ["Clinical precision", "Patient communication", "Treatment planning", "Manual dexterity"] },
  { rank: 17, title: "Engineering Director", salary: "£70,000 - £130,000", sector: "Technology", description: "Lead engineering teams building software products. Combine deep technical knowledge with people management and strategic planning.", howToGetIn: "Software engineering background (8-15 years), with progression from IC to team lead to director. Strong technical and leadership skills both required.", keySkills: ["Technical architecture", "People management", "Strategic planning", "Recruitment"] },
  { rank: 18, title: "Chartered Financial Planner", salary: "£40,000 - £100,000+", sector: "Finance", description: "Advise high-net-worth individuals on investments, pensions, tax planning, and estate planning. Fee-based planners can earn more than commission-based advisers.", howToGetIn: "CII Level 6 Diploma, then Chartered status. Can start without a degree through apprenticeship routes.", keySkills: ["Financial analysis", "Client relationships", "Regulatory knowledge", "Communication"] },
  { rank: 19, title: "Pharmacist", salary: "£35,000 - £70,000+", sector: "Medical", description: "Dispense medications, advise patients, and manage pharmacy operations. Hospital pharmacists and pharmacy owners earn at the top end.", howToGetIn: "MPharm degree (4 years) plus 1-year pre-registration training.", keySkills: ["Clinical knowledge", "Attention to detail", "Patient communication", "Regulatory compliance"] },
  { rank: 20, title: "Solutions Architect", salary: "£60,000 - £110,000", sector: "Technology", description: "Design complex technology solutions for organisations. Bridge the gap between business requirements and technical implementation.", howToGetIn: "Software development background (7-12 years), with broadening into infrastructure and integration. AWS/Azure certifications valuable.", keySkills: ["System design", "Technical breadth", "Communication", "Problem solving"] },
  { rank: 21, title: "Airline Captain", salary: "£90,000 - £170,000", sector: "Transport", description: "Command commercial aircraft with full responsibility for the flight, crew, and passengers. Seniority-based pay progression with excellent benefits.", howToGetIn: "First Officer experience (5-10 years), then command course. Long-haul wide-body captains earn the most.", keySkills: ["Leadership", "Decision making", "Communication", "Situational awareness"] },
  { rank: 22, title: "Tax Director", salary: "£70,000 - £130,000", sector: "Finance", description: "Lead tax strategy for corporations or tax advisory practices. Combine technical tax expertise with strategic business advice.", howToGetIn: "ACA/CTA qualifications, then 10-15 years in tax with progressive responsibility. Big 4 accounting firms are the traditional route.", keySkills: ["Tax legislation", "Analytical thinking", "Client management", "Strategic planning"] },
  { rank: 23, title: "DevOps Lead", salary: "£60,000 - £100,000", sector: "Technology", description: "Manage cloud infrastructure, CI/CD pipelines, and platform engineering teams. High demand driven by cloud migration across all industries.", howToGetIn: "IT support or sysadmin background, then 5-8 years in DevOps/platform engineering. AWS/Azure certifications. No degree required.", keySkills: ["Cloud platforms", "Automation", "Linux", "Problem solving"] },
  { rank: 24, title: "Veterinary Surgeon (Specialist)", salary: "£40,000 - £90,000+", sector: "Medical", description: "Specialist vets in areas like orthopaedics, neurology, or oncology earn significantly more than general practice vets.", howToGetIn: "Veterinary degree (5 years), then residency and specialist examinations (3-5 years).", keySkills: ["Clinical skills", "Empathy", "Decision making", "Communication"] },
  { rank: 25, title: "UX Director", salary: "£70,000 - £120,000", sector: "Technology", description: "Lead user experience strategy and design teams. Combine research, design, and business strategy to create products users love.", howToGetIn: "8-12 years in UX with progression from designer/researcher to lead to director. Portfolio of impact is essential.", keySkills: ["Design thinking", "Research methods", "Leadership", "Strategic planning"] },
];

const SECTORS = ["Technology", "Medical", "Finance", "Legal", "Consulting", "Leadership", "Engineering", "Transport"] as const;

export default function HighestPayingCareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "25 Highest Paying Careers in the UK (2026)",
            description: "Real salary data for the UK's best-paid careers with entry routes and skills needed.",
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
        {" / "}<span className="text-gray-600">Highest Paying Careers UK</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        25 Highest Paying Careers in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        What are the highest paying jobs in the UK right now? We have compiled the definitive list for 2026, using data from ONS earnings surveys, Glassdoor, Reed, and our own job market analysis. Every role includes realistic salary ranges (not just the headline figures), entry routes, and the skills you need to get there.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The UK's highest-paying careers span technology, medicine, finance, and law. What connects them is not a single degree or background, but a combination of deep expertise, problem-solving ability, and leadership skills. Many of these roles are accessible without a traditional university pathway.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        We have ranked them by typical earning potential rather than maximum possible salary, because the outliers are not representative. A FTSE 100 CEO earns millions, but the average CEO earns £80k-£250k. Honest ranges are more useful.
      </p>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Which high-paying careers match YOUR skills?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will show you the highest-paying roles your experience qualifies you for.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My CV Free
        </Link>
      </div>

      {/* Quick Nav by Sector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Browse by sector</h2>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <a
              key={s}
              href={`#${s.toLowerCase()}`}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Full Ranked List */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Complete List</h2>
        <div className="space-y-5">
          {JOBS.map((job, i) => (
            <div key={job.title} id={i === 0 ? job.sector.toLowerCase() : undefined}>
              {/* Sector header if first in sector */}
              {(i === 0 || JOBS[i - 1].sector !== job.sector) && (
                <div id={job.sector.toLowerCase()} className="pt-4 mb-4">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{job.sector}</span>
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-gray-400 mr-2">#{job.rank}</span>
                    <span className="text-lg font-semibold text-gray-900">{job.title}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-indigo-600">How to get in</span>
                  <p className="text-sm text-gray-600 mt-1">{job.howToGetIn}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.keySkills.map((skill) => (
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

              {/* Inline CTAs at specific positions */}
              {i === 5 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-6">
                  <h3 className="text-lg font-semibold mb-2">Already have skills for a high-paying career?</h3>
                  <p className="text-gray-300 text-sm mb-4">You might be closer to a high-paying role than you think. Our AI analyses your CV and finds the best-paying careers your skills already qualify you for.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    See My Highest-Paying Matches
                  </Link>
                </div>
              )}
              {i === 12 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-6">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Notice a pattern?</span> Many of the highest-paying careers value skills like problem solving, communication, and leadership, skills you may already have from a completely different field. Your transferable skills could be worth more than you realise.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Check your skill match</Link>.
                  </p>
                </div>
              )}
              {i === 19 && (
                <div className="bg-indigo-50 rounded-xl p-5 mt-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">5 of the top 25 do not require a traditional degree</div>
                    <div className="text-sm text-gray-500">Software engineering, cybersecurity, DevOps, and more are accessible through bootcamps and certifications.</div>
                  </div>
                  <Link href="/high-paying-jobs-no-degree" className="text-indigo-600 font-medium text-sm whitespace-nowrap hover:text-indigo-700">
                    See all no-degree careers
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="bg-amber-50 rounded-xl p-6 sm:p-8 mb-10 border border-amber-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaways</h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold flex-shrink-0">1.</span>
            <span><strong>Technology dominates</strong> the top 25, with 7 roles. Tech careers are among the most accessible through non-traditional routes.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold flex-shrink-0">2.</span>
            <span><strong>Medicine pays well but takes longest</strong> to enter. 10-15 years of training is the norm for specialist doctors.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold flex-shrink-0">3.</span>
            <span><strong>Leadership and communication skills</strong> appear in almost every top-paying role, regardless of sector.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold flex-shrink-0">4.</span>
            <span><strong>No degree is required</strong> for at least 5 of the top 25 roles, particularly in technology.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600 font-bold flex-shrink-0">5.</span>
            <span><strong>Transferable skills</strong> like problem solving, stakeholder management, and analytical thinking are valued across all sectors.</span>
          </li>
        </ul>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Find your highest-paying career match
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your experience and discover which of these high-paying careers your skills already match. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Discover My Career Matches
          </Link>
          <Link href="/high-paying-jobs-no-degree" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">
            High Paying Jobs (No Degree)
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Without a Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/what-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">What Jobs Can I Get</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
        </div>
      </div>
    </div>
  );
}
