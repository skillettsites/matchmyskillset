import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Jobs for People With ADHD (2026) | Careers That Fit",
  description:
    "The best careers for people with ADHD. Roles that reward hyperfocus, creativity, and energy rather than punishing inattention. UK salary data and practical advice.",
  keywords: [
    "best jobs for ADHD",
    "careers for people with ADHD",
    "ADHD friendly jobs",
    "ADHD career advice",
    "jobs for ADHD adults UK",
    "ADHD at work",
  ],
  openGraph: {
    title: "Best Jobs for People With ADHD (2026)",
    description: "Careers that reward ADHD strengths like creativity, energy, and hyperfocus.",
    type: "article",
  },
};

export default function ADHDJobsPage() {
  const jobs = [
    { title: "Software Developer", salary: "£28,000 - £70,000", category: "Hyperfocus", why: "Coding triggers hyperfocus for many people with ADHD. The constant problem-solving, immediate feedback, and variety of challenges keep your brain engaged. Remote work options mean you can control your environment." },
    { title: "Entrepreneur / Self-Employed", salary: "Variable", category: "Energy", why: "Running your own business lets you channel your energy into something you care about. You set the rules, the variety is endless, and the adrenaline of building something keeps ADHD brains engaged." },
    { title: "Emergency Services (Paramedic, Firefighter)", salary: "£24,000 - £45,000", category: "Stimulation", why: "High-stakes, fast-paced environments where quick thinking is rewarded. ADHD brains often thrive in genuine emergencies because the urgency eliminates the need for self-generated motivation." },
    { title: "Graphic / UX Designer", salary: "£24,000 - £60,000", category: "Creativity", why: "Visual, creative work with constant variety. Each project is different. The combination of creativity and problem-solving suits ADHD thinkers who struggle with repetitive tasks." },
    { title: "Sales (Especially SaaS/Tech)", salary: "£25,000 - £70,000+ (OTE)", category: "Energy", why: "Short-term targets, constant variety, and social interaction. Commission-based pay provides the immediate reward that ADHD brains crave. No two days are the same." },
    { title: "Journalist / Content Creator", salary: "£22,000 - £50,000", category: "Stimulation", why: "Deadlines create urgency (which ADHD brains need). Every story is different. The research phase feeds curiosity. The variety prevents the boredom that kills focus." },
    { title: "Personal Trainer / Fitness Coach", salary: "£20,000 - £45,000", category: "Energy", why: "Active, social, varied, and every client is a different challenge. Physical movement helps regulate ADHD symptoms. You are never stuck at a desk." },
    { title: "Chef", salary: "£22,000 - £42,000", category: "Stimulation", why: "Fast-paced, hands-on, and intensely focused during service. The structured chaos of a kitchen works with ADHD energy rather than against it." },
    { title: "Marketing Strategist", salary: "£28,000 - £55,000", category: "Creativity", why: "Mix of creative thinking, data analysis, and strategy. Campaign work provides project-based variety. Social media management suits the quick-thinking ADHD mind." },
    { title: "Project Manager (Agile)", salary: "£32,000 - £65,000", category: "Structure", why: "Counter-intuitive, but agile project management with its short sprints, daily stand-ups, and clear deliverables provides external structure that ADHD brains benefit from." },
    { title: "Cybersecurity Analyst", salary: "£28,000 - £65,000", category: "Hyperfocus", why: "Threat hunting and incident response trigger hyperfocus. The constantly evolving threat landscape provides the novelty ADHD brains need. High demand means flexibility in working arrangements." },
    { title: "Recruiter", salary: "£22,000 - £55,000+ (OTE)", category: "Energy", why: "Fast-paced, social, target-driven. Every candidate and role is different. The multi-tasking nature of recruitment suits ADHD processing. Quick wins provide dopamine." },
  ];

  const categories = ["Hyperfocus", "Energy", "Creativity", "Stimulation", "Structure"] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Jobs for People With ADHD (2026)",
            description: "Careers that reward ADHD strengths including hyperfocus, creativity, and high energy.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Jobs for People With ADHD</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Best Jobs for People With ADHD
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        ADHD is not a limitation to work around. It is a different operating system with genuine strengths: creativity, hyperfocus on interesting tasks, high energy, risk tolerance, and the ability to think laterally. The problem is not ADHD itself; it is being in a role that punishes these traits instead of rewarding them.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Research from the University of Memphis found that adults with ADHD score higher on measures of creative thinking, divergent problem-solving, and entrepreneurial inclination. The key is matching your brain to a career that feeds it rather than starves it.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers 12 careers organised by the ADHD strength they reward most: hyperfocus, energy, creativity, stimulation, and external structure.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">4%</div>
          <div className="text-xs text-gray-500">UK adults have ADHD</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">2x</div>
          <div className="text-xs text-gray-500">More likely to start a business</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">Higher</div>
          <div className="text-xs text-gray-500">Creative thinking scores</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">35%</div>
          <div className="text-xs text-gray-500">Of entrepreneurs have ADHD</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your ADHD brain has unique strengths</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your skills and working style to careers where ADHD is an advantage.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Browse by ADHD strength</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <a key={cat} href={`#${cat.toLowerCase()}`} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              {cat}
            </a>
          ))}
        </div>
      </div>

      <section className="mb-12">
        <div className="space-y-5">
          {jobs.map((job, idx) => (
            <div key={job.title} id={idx === 0 ? "hyperfocus" : idx === 1 ? "energy" : idx === 3 ? "creativity" : idx === 2 ? "stimulation" : idx === 9 ? "structure" : undefined}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium mb-3">
                  ADHD strength: {job.category}
                </div>
                <p className="text-sm text-gray-600">{job.why}</p>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Your brain is wired differently, not wrong</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI matches your specific skills and working style to careers where ADHD traits are valued, not punished.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 8 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">35% of entrepreneurs have ADHD.</span> The same traits that make traditional employment difficult make business ownership natural.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Explore your options</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Workplace tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Workplace Strategies for ADHD</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Use external structure</h3>
            <p className="text-sm text-gray-600">Calendars, timers, task apps, and accountability partners compensate for internal executive function challenges. Build the scaffolding your brain needs.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Request reasonable adjustments</h3>
            <p className="text-sm text-gray-600">ADHD is a protected disability under the Equality Act 2010. You can request noise-cancelling headphones, flexible hours, written instructions, and more.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Schedule around your energy</h3>
            <p className="text-sm text-gray-600">ADHD brains have peak focus windows. Identify yours and schedule your most important work during them. Protect these windows from meetings.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Choose roles with variety</h3>
            <p className="text-sm text-gray-600">Repetitive, monotonous work is ADHD kryptonite. Prioritise roles with project-based variety, client diversity, or rotating responsibilities.</p>
          </div>
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to find a career that works with your brain?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and discover your matches &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Find careers that fit your brain</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover careers where your ADHD traits are strengths, not challenges. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-empaths" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Empaths</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-jobs-for-work-life-balance" className="text-sm text-indigo-600 hover:text-indigo-700">Work-Life Balance Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/freelance-careers-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Freelance Careers UK</Link>
        </div>
      </div>
    </div>
  );
}
