import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "15 Best Jobs for Work-Life Balance UK (2026)",
  description:
    "The best UK jobs for work-life balance in 2026. Roles with flexible hours, minimal overtime, remote options, and genuine respect for your personal time. Salary data included.",
  keywords: [
    "best jobs for work life balance UK",
    "jobs with good hours",
    "flexible careers UK",
    "low stress jobs UK",
    "9 to 5 jobs UK",
    "work life balance careers",
  ],
  openGraph: {
    title: "15 Best Jobs for Work-Life Balance UK (2026)",
    description: "Careers that respect your personal time. Flexible hours, remote options, and fair salaries.",
    type: "article",
  },
};

const JOBS = [
  { title: "Civil Servant (Executive Officer)", salary: "£28,000 - £38,000", hours: "37 hrs/week, flexitime", remote: "Hybrid (2-3 days office)", why: "Genuine 37-hour weeks, flexitime, generous annual leave (25-30 days plus bank holidays), and a culture that respects boundaries. Overtime is rare and paid or time-off-in-lieu when it happens." },
  { title: "UX Designer", salary: "£30,000 - £65,000", hours: "Standard, deadline-driven", remote: "Fully remote common", why: "Creative, project-based work with clear deliverables. Most UX teams operate on sprints with predictable workloads. Remote-first companies offer maximum flexibility." },
  { title: "Data Analyst", salary: "£25,000 - £55,000", hours: "Standard 37-40 hrs", remote: "Hybrid to fully remote", why: "Analytical work that rarely has evening or weekend demands. Deadlines are usually weekly or monthly, not hourly. The work stays at work." },
  { title: "Librarian", salary: "£24,000 - £38,000", hours: "35-37 hrs/week", remote: "On-site, regular hours", why: "Structured hours, quiet working environment, and minimal stress. Academic librarians get generous holiday allowances. A genuinely calm profession." },
  { title: "Technical Writer", salary: "£28,000 - £55,000", hours: "Standard, self-paced", remote: "Fully remote common", why: "Write documentation at your own pace within reasonable deadlines. No emergencies, no on-call, no weekend work. One of the most boundary-friendly tech roles." },
  { title: "Occupational Therapist", salary: "£28,000 - £44,000", hours: "37.5 hrs/week (NHS)", remote: "On-site, regular hours", why: "NHS hours with genuine off-time. Helping people regain independence is rewarding without the acute pressures of A&E or ward nursing." },
  { title: "Actuary", salary: "£35,000 - £80,000+", hours: "35-40 hrs/week", remote: "Hybrid standard", why: "Despite the high salary, actuarial work is remarkably predictable. Projects have long timelines. The culture values precision over speed." },
  { title: "University Lecturer", salary: "£35,000 - £60,000", hours: "Flexible around teaching", remote: "Hybrid, term-time focused", why: "Teaching hours are fixed but preparation and research are self-managed. Long holidays (significantly more than school teachers). Autonomy over your schedule." },
  { title: "Primary School Teacher", salary: "£28,000 - £43,000", hours: "School hours + planning", remote: "On-site, term-time only", why: "Yes, workload is high during term. But 13 weeks of holiday per year, finishing by 3:30pm most days, and alignment with children's schedules make this work for many parents. Entry on this list is conditional on managing workload boundaries." },
  { title: "Pharmacist", salary: "£35,000 - £48,000", hours: "Regular shifts", remote: "On-site", why: "Structured hours, no on-call (in community pharmacy), and the work does not follow you home. Locum pharmacists have even more schedule control." },
  { title: "Speech Therapist", salary: "£27,000 - £42,000", hours: "37.5 hrs (NHS)", remote: "Hybrid/on-site", why: "Appointment-based work with clear boundaries. No overnight shifts. Meaningful patient interaction without the life-or-death pressure of acute clinical roles." },
  { title: "Quality Assurance Analyst", salary: "£28,000 - £50,000", hours: "Standard 37-40 hrs", remote: "Hybrid to fully remote", why: "Methodical testing work with clear sprint deadlines. QA teams rarely work overtime because rushing testing defeats the purpose." },
  { title: "Compliance Officer", salary: "£30,000 - £55,000", hours: "Standard 37-40 hrs", remote: "Hybrid common", why: "Regulatory work with predictable deadlines (usually quarterly or annual). Urgency is rare. The work is intellectually engaging without being high-pressure." },
  { title: "Graphic Designer (In-House)", salary: "£24,000 - £45,000", hours: "Standard, campaign-driven", remote: "Hybrid common", why: "In-house designers (as opposed to agency) have more predictable workloads, fewer late nights, and better boundaries. You still do creative work but within sane hours." },
  { title: "Web Developer (Freelance)", salary: "£30,000 - £70,000+", hours: "You decide", remote: "100% remote", why: "Complete control over your schedule, clients, and workload. The ultimate work-life balance role if you have the self-discipline to manage it." },
];

export default function WorkLifeBalancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "15 Best Jobs for Work-Life Balance UK (2026)",
            description: "UK careers with genuine work-life balance, flexible hours, and fair salaries.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Best Jobs for Work-Life Balance</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        15 Best Jobs for Work-Life Balance in the UK (2026)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>10 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Work-life balance is not laziness. It is the recognition that your best work comes from a rested, healthy person with a life outside the office. The CIPD found that employees with good work-life balance are 21% more productive and 33% less likely to leave their employer.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This list includes careers that genuinely respect personal time, not just roles that claim to in the job advert but expect 50-hour weeks in practice. Every role has been assessed on actual working hours, overtime expectations, remote flexibility, and the ability to switch off at the end of the day.
      </p>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Find roles that match your skills AND your lifestyle</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will find careers that value your skills without consuming your life.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Job Listings */}
      <section className="mb-12">
        <div className="space-y-5">
          {JOBS.map((job, idx) => (
            <div key={job.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{job.hours}</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">{job.remote}</span>
                </div>
                <p className="text-sm text-gray-600">{job.why}</p>
              </div>

              {idx === 4 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Balance is not about earning less</h3>
                  <p className="text-gray-300 text-sm mb-4">Many of these roles pay more than the jobs burning you out. Our AI finds the intersection of good pay and good hours for your specific skills.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 9 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Employees with good work-life balance are 21% more productive.</span> Protecting your time is not selfish; it makes you better at your job.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Find your balanced career</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Want a career that respects your time?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see balanced careers that match your skills &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Find your balanced career</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover careers that match your skills and respect your personal time. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-empaths" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Empaths</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-people-who-hate-their-job" className="text-sm text-indigo-600 hover:text-indigo-700">Hate Your Job?</Link>
        </div>
      </div>
    </div>
  );
}
