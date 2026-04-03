import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Jobs for Women Returning to Work UK (2026 Guide)",
  description:
    "Practical guide for women returning to work after a career break. Flexible roles, returnship programmes, and how to sell your break as a strength. Salary data included.",
  keywords: [
    "returning to work after career break",
    "jobs for mums returning to work UK",
    "back to work after maternity",
    "career break women UK",
    "returnship programmes UK",
    "flexible jobs for mums",
  ],
  openGraph: {
    title: "Best Jobs for Women Returning to Work UK (2026)",
    description:
      "Flexible careers, returnship programmes, and practical steps for women returning after a career break.",
    type: "article",
  },
};

interface ReturnToWorkJob {
  title: string;
  salary: string;
  flexibility: string;
  whySuited: string;
  entryRoute: string;
}

const JOBS: ReturnToWorkJob[] = [
  {
    title: "Teaching Assistant",
    salary: "£18,000 - £25,000",
    flexibility: "Term-time only, school hours",
    whySuited: "Hours align perfectly with school schedules. No evening or weekend work. Your parenting experience gives you genuine insight into child development that employers value.",
    entryRoute: "Level 2/3 Teaching Assistant qualification. Many schools hire without formal qualifications and train on the job.",
  },
  {
    title: "Virtual Assistant",
    salary: "£20,000 - £38,000",
    flexibility: "Fully remote, set your own hours",
    whySuited: "Choose your clients, hours, and workload. Start with 10 hours a week and scale up. The organisational skills you developed managing a household translate directly.",
    entryRoute: "Register on Time Etc or Virtalent. No qualification required. Strong admin and communication skills are enough.",
  },
  {
    title: "Bookkeeper",
    salary: "£22,000 - £38,000",
    flexibility: "Remote, flexible deadlines",
    whySuited: "Cloud accounting means you can work from anywhere. Clients need consistent monthly work rather than daily hours, giving you control over your schedule.",
    entryRoute: "IAB or ICB bookkeeping qualification (6-12 months part-time). Xero certification. Then build a client base of small businesses.",
  },
  {
    title: "HR Administrator",
    salary: "£22,000 - £32,000",
    flexibility: "Hybrid or remote common",
    whySuited: "People skills, empathy, and organisational ability are the core requirements. Many HR teams actively support flexible working because they advocate it for the wider business.",
    entryRoute: "CIPD Level 3 Foundation Certificate. Previous admin experience counts. Many roles offer part-time or compressed hours.",
  },
  {
    title: "Content Writer / Copywriter",
    salary: "£24,000 - £45,000",
    flexibility: "Fully remote, deadline-based",
    whySuited: "Write during school hours, evenings, or whenever suits you. Freelance copywriting is one of the most schedule-friendly careers. Your communication skills are the primary requirement.",
    entryRoute: "Build a portfolio of sample work. Start on Upwork or PeoplePerHour. Pitch to agencies and businesses directly.",
  },
  {
    title: "Project Coordinator",
    salary: "£25,000 - £38,000",
    flexibility: "Hybrid, 2-3 days office",
    whySuited: "Managing a household with children is project management in disguise: scheduling, budgeting, juggling priorities, and dealing with stakeholders who refuse to cooperate. Employers increasingly recognise this.",
    entryRoute: "PRINCE2 Foundation (1 week course). Or APM qualification. Your organisational experience is your biggest asset.",
  },
  {
    title: "Medical Receptionist",
    salary: "£20,000 - £26,000",
    flexibility: "Part-time shifts available",
    whySuited: "GP surgeries and clinics regularly offer part-time and job-share arrangements. The role rewards patience, empathy, and calm under pressure.",
    entryRoute: "Direct application. No formal qualifications required. Customer service experience is valued.",
  },
  {
    title: "UX Researcher",
    salary: "£30,000 - £55,000",
    flexibility: "Remote-first common",
    whySuited: "Your lived experience as a parent gives you genuine empathy and insight. One-to-one interviews, qualitative analysis, and report writing suit returners who want meaningful, flexible work.",
    entryRoute: "Google UX Design Certificate or UX bootcamp (12-16 weeks). Psychology, teaching, or research backgrounds transfer well.",
  },
  {
    title: "Social Media Manager",
    salary: "£24,000 - £42,000",
    flexibility: "Remote, flexible scheduling",
    whySuited: "Content can be scheduled in advance. Strategy work happens during your chosen hours. If you have been managing personal social media during your break, you already have current skills.",
    entryRoute: "Build a portfolio managing accounts (even voluntary ones). HubSpot Social Media certification (free). Freelance or agency roles.",
  },
  {
    title: "Data Entry / Admin Support",
    salary: "£18,000 - £26,000",
    flexibility: "Remote, part-time available",
    whySuited: "Straightforward re-entry point with minimal barriers. Flexible hours and remote options are standard. Can be a stepping stone to more senior administrative roles.",
    entryRoute: "Direct application. Basic IT skills and attention to detail. Temp agencies like Reed and Hays regularly have flexible admin roles.",
  },
  {
    title: "Counsellor / Therapist",
    salary: "£25,000 - £45,000",
    flexibility: "Set your own client hours",
    whySuited: "Life experience, including parenthood, strengthens your practice. Online therapy platforms mean you can see clients from home. Choose how many hours you work each week.",
    entryRoute: "Counselling diploma (2-3 years part-time). BACP registration. Start seeing clients through online platforms.",
  },
  {
    title: "Recruitment Consultant",
    salary: "£22,000 - £50,000+ (OTE)",
    flexibility: "Hybrid, some flexibility",
    whySuited: "Strong communication and people skills are the core requirements. Many agencies now offer flexible working. Commission-based pay rewards results over hours worked.",
    entryRoute: "Direct application. No qualifications required. Your networking and relationship skills from all areas of life count.",
  },
];

export default function WomenReturningToWorkPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Jobs for Women Returning to Work UK (2026)",
            description:
              "Practical guide for women returning to work after a career break, with flexible roles and returnship programmes.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: {
              "@type": "Organization",
              name: "MatchMySkillset",
              url: "https://matchmyskillset.com",
            },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <span className="text-gray-600">Jobs for Women Returning to Work</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Best Jobs for Women Returning to Work in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Returning to work after a career break is not starting over. It is picking up from a position of strength you have not fully recognised yet. Whether you took time out for childcare, caring responsibilities, or personal reasons, your skills did not expire when you stepped away.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        According to PwC, women returning to work after a career break represent a talent pool worth £1.7 billion to the UK economy. The Women Returners programme found that 90% of career break returners perform at or above the level expected within 6 months.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers 12 flexible roles suited to returners, returnship programmes you should know about, and how to position your career break as an asset rather than a gap.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£1.7bn</div>
          <div className="text-xs text-gray-500">Value of returner talent pool</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">90%</div>
          <div className="text-xs text-gray-500">Perform at expected level in 6 months</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">427k</div>
          <div className="text-xs text-gray-500">Women on career breaks in UK</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">76%</div>
          <div className="text-xs text-gray-500">Employers prioritise skills over gaps</div>
        </div>
      </div>

      {/* CTA 1 - Style A */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your career break built skills employers want</div>
          <div className="text-sm text-gray-500">
            Upload your CV (even an old one) and our AI will identify every transferable skill, including the ones your break developed.
          </div>
        </div>
        <Link
          href="/discover"
          className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap"
        >
          Analyse My Skills Free
        </Link>
      </div>

      {/* Job Listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          12 Flexible Careers for Returners
        </h2>
        <div className="space-y-5">
          {JOBS.map((job, idx) => (
            <div key={job.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                  {job.flexibility}
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600">Why it suits returners</span>
                    <p className="text-sm text-gray-600 mt-1">{job.whySuited}</p>
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

              {/* Inline CTAs after specific items */}
              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Your gap is not a weakness</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Our AI analyses what you did before your break and matches you to careers where those skills are in demand right now. No judgement on gaps.
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 7 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Did you know?</span> Research from Harvard Business School shows that employees who have taken career breaks often demonstrate stronger problem-solving and perspective-taking skills than those with uninterrupted careers.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
                      Discover your matches
                    </Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Returnship Programmes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Returnship Programmes Worth Knowing About
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Returnships are paid programmes designed specifically for people re-entering the workforce after a career break. They typically last 12-16 weeks and often lead to permanent roles. Major UK employers now offer them.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Corporate Returnships</h3>
            <p className="text-sm text-gray-600">
              J.P. Morgan, Goldman Sachs, Deloitte, Amazon, and O2 all run formal returnship programmes. Search "returnship" on their careers pages. These are paid, structured re-entry routes with mentoring and training.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Women Returners Network</h3>
            <p className="text-sm text-gray-600">
              The UK's leading resource for career break returners. Lists returnship opportunities, coaching programmes, and events. Sign up at womenreturners.com for alerts when new programmes launch.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Civil Service Returners</h3>
            <p className="text-sm text-gray-600">
              The UK Civil Service runs specific returner programmes across multiple government departments. Flexible working, competitive salaries, and strong progression. Search the Civil Service Jobs portal.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Tech Returners</h3>
            <p className="text-sm text-gray-600">
              If you had a tech career before your break, organisations like FDM Group, Capgemini, and ThoughtWorks run specific tech returner programmes with retraining and placement support.
            </p>
          </div>
        </div>
      </section>

      {/* Positioning Your Break */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How to Position Your Career Break
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">On your CV: state it simply</h3>
            <p className="text-sm text-gray-600">
              "Career break for family responsibilities (2021-2026)" is honest, professional, and requires no further explanation. Then focus the rest of your CV on skills and achievements, not chronology. A skills-based CV format works better than chronological for returners.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">In interviews: reframe, do not apologise</h3>
            <p className="text-sm text-gray-600">
              "I took a planned break to focus on my family, and I used that time to [volunteer, study, manage complex logistics]. I am returning with fresh perspective and strong motivation." Confidence matters more than continuity.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Fill the gap with something</h3>
            <p className="text-sm text-gray-600">
              Any activity during your break counts: volunteering, school governor roles, freelance projects, online courses, managing household finances. These demonstrate continuous learning and engagement. List them on your CV.
            </p>
          </div>
        </div>
      </section>

      {/* CTA 4 - Style D simple arrow link */}
      <p className="text-gray-600 mb-10">
        Not sure where to start?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see which careers match your skills in 2 minutes &rarr;
        </Link>
      </p>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Your skills did not expire. Let us prove it.
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your pre-break experience. Our AI identifies your transferable skills and matches you to flexible careers. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Discover My Career Matches
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors"
          >
            Take the Career Quiz
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-jobs-for-work-life-balance" className="text-sm text-indigo-600 hover:text-indigo-700">Best Jobs for Work-Life Balance</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
          <span className="text-gray-300">|</span>
          <Link href="/how-to-write-a-cv-for-career-change" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change CV Guide</Link>
        </div>
      </div>
    </div>
  );
}
