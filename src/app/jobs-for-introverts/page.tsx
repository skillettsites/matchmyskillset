import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "15 Best Jobs for Introverts UK (2026) | Quiet Careers That Pay Well",
  description:
    "Discover the best jobs for introverts in the UK. Remote work, analytical roles, creative positions, and technical careers that suit quiet, thoughtful people. Salary data included.",
  keywords: [
    "best jobs for introverts",
    "careers for introverts UK",
    "quiet jobs",
    "jobs for shy people",
    "introvert friendly careers",
    "remote jobs for introverts",
  ],
  openGraph: {
    title: "15 Best Jobs for Introverts UK (2026)",
    description:
      "Quiet, well-paying careers that suit introverts. Remote, analytical, creative, and technical roles with salary ranges.",
    type: "article",
  },
};

interface IntrovertJob {
  title: string;
  salary: string;
  category: string;
  whySuited: string;
  dayToDay: string;
  entryRoute: string;
}

const JOBS: IntrovertJob[] = [
  {
    title: "Data Analyst",
    salary: "£25,000 - £55,000",
    category: "Analytical",
    whySuited: "Mostly independent, focused work. You spend your day with spreadsheets, databases, and dashboards rather than in back-to-back meetings. Communication is primarily through written reports and visualisations.",
    dayToDay: "Querying databases, building dashboards, spotting trends, and presenting findings in clear written reports.",
    entryRoute: "Google Data Analytics Certificate, then junior analyst roles. No degree required.",
  },
  {
    title: "Software Developer",
    salary: "£30,000 - £75,000",
    category: "Technical",
    whySuited: "Deep focused coding with headphones on. Collaboration happens through pull requests and code reviews rather than constant meetings. Many teams use async communication by default.",
    dayToDay: "Writing code, solving problems, reviewing others' work, and occasional pair programming sessions.",
    entryRoute: "Bootcamp (12-16 weeks), self-taught portfolio, or computer science degree. Many paths in.",
  },
  {
    title: "UX Researcher",
    salary: "£30,000 - £60,000",
    category: "Analytical",
    whySuited: "While you do conduct interviews, they are one-to-one and structured. Most of your time is spent analysing data, writing reports, and working independently on research plans.",
    dayToDay: "Planning research studies, conducting user interviews, analysing patterns, and writing insight reports.",
    entryRoute: "UX bootcamp or conversion from psychology, teaching, or market research backgrounds.",
  },
  {
    title: "Technical Writer",
    salary: "£28,000 - £55,000",
    category: "Creative",
    whySuited: "You work primarily through writing, not speaking. The role rewards clear thinking, attention to detail, and the ability to make complex information accessible. Meetings are minimal.",
    dayToDay: "Writing documentation, API guides, help articles, and process descriptions. Reviewing technical accuracy with engineers.",
    entryRoute: "Strong writing skills plus willingness to learn technical subjects. English or STEM backgrounds both welcome.",
  },
  {
    title: "Accountant",
    salary: "£25,000 - £60,000",
    category: "Analytical",
    whySuited: "Structured, detail-oriented work with clear processes. Client interaction exists but is professional and predictable. Much of the day involves focused number work.",
    dayToDay: "Preparing accounts, tax returns, audits, and financial reports. Advisory meetings with clients.",
    entryRoute: "AAT qualification, then ACCA or CIMA. Can start without a degree.",
  },
  {
    title: "Graphic Designer",
    salary: "£22,000 - £50,000",
    category: "Creative",
    whySuited: "Creative work that speaks through visuals, not words. Briefs are discussed in short meetings, then you work independently. Freelance options offer even more control over your environment.",
    dayToDay: "Designing logos, marketing materials, web layouts, and brand assets. Client feedback rounds.",
    entryRoute: "Portfolio is king. Degree helpful but not essential. Adobe Creative Suite skills are the baseline.",
  },
  {
    title: "Cybersecurity Analyst",
    salary: "£30,000 - £65,000",
    category: "Technical",
    whySuited: "Highly technical, investigative work. You spend most of your time monitoring systems, analysing threats, and building defences. The role rewards careful, methodical thinking over charisma.",
    dayToDay: "Monitoring security alerts, investigating incidents, running vulnerability assessments, writing security policies.",
    entryRoute: "CompTIA Security+ certification, then entry-level SOC analyst role. High demand, fast progression.",
  },
  {
    title: "Archivist / Records Manager",
    salary: "£22,000 - £40,000",
    category: "Remote & Flexible",
    whySuited: "Quiet, organised work preserving and cataloguing documents and collections. Minimal public-facing interaction. Appeals to people who love structure and history.",
    dayToDay: "Cataloguing materials, managing digital and physical archives, ensuring preservation standards.",
    entryRoute: "Archives and records management postgraduate qualification. Some roles available without.",
  },
  {
    title: "Freelance Copywriter",
    salary: "£25,000 - £60,000+",
    category: "Creative",
    whySuited: "Work from home, set your own hours, and communicate primarily through email. Your words do the talking, not you. Introverts often write better copy because they think before they speak.",
    dayToDay: "Writing website copy, email campaigns, social posts, and sales pages for clients.",
    entryRoute: "Build a portfolio, start on freelance platforms, then build direct client relationships.",
  },
  {
    title: "Research Scientist",
    salary: "£28,000 - £55,000",
    category: "Analytical",
    whySuited: "Deep intellectual work with extended periods of independent study and experimentation. Collaboration happens in small, focused teams. Publications speak louder than presentations.",
    dayToDay: "Designing experiments, analysing results, writing papers, attending specialist seminars.",
    entryRoute: "Relevant degree plus postgraduate study. Industry research roles also available.",
  },
  {
    title: "DevOps Engineer",
    salary: "£35,000 - £75,000",
    category: "Technical",
    whySuited: "Infrastructure and automation work that rewards systematic thinking. Interaction is primarily with other technical people through tickets and documentation rather than large group settings.",
    dayToDay: "Managing cloud infrastructure, writing automation scripts, monitoring system performance, improving deployment pipelines.",
    entryRoute: "IT support or sysadmin experience, then AWS/Azure certifications. Strong Linux skills essential.",
  },
  {
    title: "Librarian",
    salary: "£20,000 - £35,000",
    category: "Remote & Flexible",
    whySuited: "A quiet, structured environment where you help people find information. Interactions are brief and purposeful. Digital librarian roles are increasingly common.",
    dayToDay: "Cataloguing resources, helping patrons with research, managing digital collections, running quiet events.",
    entryRoute: "Librarianship postgraduate qualification. Volunteering at libraries helps build experience.",
  },
  {
    title: "SEO Specialist",
    salary: "£25,000 - £55,000",
    category: "Technical",
    whySuited: "Analytical, data-driven work with minimal face-to-face interaction. You optimise websites through research, technical changes, and content strategy. Most communication is written.",
    dayToDay: "Keyword research, technical audits, content optimisation, link building, and performance reporting.",
    entryRoute: "Self-taught through blogs and courses. Google certifications help. Marketing or technical background useful.",
  },
  {
    title: "Actuary",
    salary: "£35,000 - £80,000+",
    category: "Analytical",
    whySuited: "One of the most intellectually demanding yet introvert-friendly careers. Complex mathematical analysis with clear professional progression. Communication is through reports and models.",
    dayToDay: "Building financial models, assessing risk, pricing insurance products, writing actuarial reports.",
    entryRoute: "Maths or statistics degree, then IFoA exams. Takes several years but salary rewards are significant.",
  },
  {
    title: "Video Editor",
    salary: "£22,000 - £50,000",
    category: "Creative",
    whySuited: "Hours of focused, solo creative work. You receive a brief and raw footage, then work independently to craft the final product. Feedback happens in short review sessions.",
    dayToDay: "Editing footage, colour grading, sound mixing, adding motion graphics, and exporting final cuts.",
    entryRoute: "Learn Premiere Pro or DaVinci Resolve. Build a portfolio from personal projects or free work.",
  },
];

const CATEGORIES = ["Analytical", "Technical", "Creative", "Remote & Flexible"] as const;

export default function JobsForIntrovertsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "15 Best Jobs for Introverts UK (2026)",
            description: "Quiet, well-paying careers suited to introverts including remote, analytical, creative, and technical roles.",
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
        {" / "}<span className="text-gray-600">Jobs for Introverts</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        15 Best Jobs for Introverts in the UK (2026)
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Being an introvert is not a weakness to overcome. It is a work style preference that certain careers reward handsomely. Introverts tend to think deeply, focus intensely, and produce higher-quality work in concentrated bursts. The trick is finding roles that leverage these strengths rather than fighting against them.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Research from Adam Grant at Wharton suggests that introverts are often more effective leaders than extroverts, particularly when managing proactive teams. Susan Cain's work on "quiet leadership" has shown that introverted professionals frequently outperform their louder colleagues on complex analytical tasks.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        We have compiled 15 careers that suit introverts across four categories: analytical roles, technical roles, creative positions, and remote-friendly options. Each includes UK salary data, what the day-to-day actually looks like, and how to get started.
      </p>

      {/* CTA 1 - Box style */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Not sure which introvert-friendly career suits YOU?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your specific skills and experience to quiet, rewarding careers.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My CV Free
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Jump to a category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase().replace(/ & /g, "-")}`}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Job Listings by Category */}
      {CATEGORIES.map((category, catIdx) => {
        const categoryJobs = JOBS.filter((j) => j.category === category);
        return (
          <section key={category} id={category.toLowerCase().replace(/ & /g, "-")} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category} Roles for Introverts
            </h2>
            <div className="space-y-5">
              {categoryJobs.map((job) => (
                <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600">Why it suits introverts</span>
                      <p className="text-sm text-gray-600 mt-1">{job.whySuited}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Day-to-day</span>
                      <p className="text-sm text-gray-600 mt-1">{job.dayToDay}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">How to get started</span>
                      <p className="text-sm text-gray-600 mt-1">{job.entryRoute}</p>
                    </div>
                  </div>
                  <Link
                    href={`/jobs?q=${encodeURIComponent(job.title)}`}
                    className="inline-block mt-3 text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Search {job.title} jobs
                  </Link>
                </div>
              ))}
            </div>

            {/* Inline CTA every category */}
            {catIdx === 1 && (
              <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-8">
                <h3 className="text-lg font-semibold mb-2">Your personality is an asset, not a limitation</h3>
                <p className="text-gray-300 text-sm mb-4">Upload your CV and our AI will find introvert-friendly roles that match your specific experience and skills.</p>
                <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Find My Introvert-Friendly Matches
                </Link>
              </div>
            )}
            {catIdx === 2 && (
              <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-8">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Did you know?</span> 33% of the UK workforce wants to change careers, and introverts are actually more likely to successfully transition because they research thoroughly before acting.{" "}
                  <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Discover your matches</Link>.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Tips Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Job Search Tips for Introverts
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Lead with written applications</h3>
            <p className="text-sm text-gray-600">Your ability to write thoughtful, well-structured cover letters is a genuine advantage. Many extroverts rush this step. Take your time and make every word count.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Prepare for interviews like a presentation</h3>
            <p className="text-sm text-gray-600">Introverts perform better in interviews when they prepare specific stories and examples. Rehearse out loud. Your thoughtful answers will stand out against rambling competitors.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Network through content, not events</h3>
            <p className="text-sm text-gray-600">Write LinkedIn posts, contribute to forums, or start a blog. This lets you build professional connections without the energy drain of networking events.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Ask about team culture in interviews</h3>
            <p className="text-sm text-gray-600">Ask "How does your team communicate day-to-day?" and "What is the balance between meetings and deep work?" These questions help you identify introvert-friendly cultures.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Find the perfect quiet career for you
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your experience and our AI will find introvert-friendly careers that match your specific skills. Free. 2 minutes.
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
          <Link href="/quiz" className="text-sm text-indigo-600 hover:text-indigo-700">Career Quiz</Link>
          <span className="text-gray-300">|</span>
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change by Profession</Link>
          <span className="text-gray-300">|</span>
          <Link href="/highest-paying-careers-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Careers UK</Link>
        </div>
      </div>
    </div>
  );
}
