import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change From Teaching UK (2026) | What Ex-Teachers Do",
  description:
    "Thinking of leaving teaching? Guide for UK teachers exploring career changes. 12 realistic career options, transferable skills analysis, and how to make the switch without starting over.",
  keywords: [
    "leaving teaching UK",
    "what can I do instead of teaching",
    "career change from teaching",
    "ex teacher careers",
    "quitting teaching UK",
    "teacher career change",
  ],
  openGraph: {
    title: "Career Change From Teaching UK (2026)",
    description: "12 careers for ex-teachers with salary data and transition guides. Your teaching skills are worth more than you think.",
    type: "article",
  },
};

export default function CareerChangeFromTeachingPage() {
  const careers = [
    { title: "Learning & Development Manager", salary: "£35,000 - £60,000", transition: "1-3 months", match: "95%", description: "Design and deliver training programmes for corporate employees. Your lesson planning, facilitation, and assessment skills transfer directly. This is teaching adults in a better-paid environment.", howToGet: "Apply directly. Your teaching experience is the qualification. CIPD Level 5 in L&D is a bonus but often not required." },
    { title: "Instructional Designer", salary: "£30,000 - £55,000", transition: "2-4 months", match: "90%", description: "Create e-learning courses, training materials, and educational content for businesses. If you have ever built a scheme of work or adapted resources for different learners, you have done this.", howToGet: "Learn Articulate Storyline or Rise 360 (1-2 weeks). Build 2-3 sample e-learning modules. Apply to L&D teams or e-learning agencies." },
    { title: "Education Technology (EdTech) Specialist", salary: "£30,000 - £55,000", transition: "1-2 months", match: "90%", description: "Work for companies building educational software. Your classroom experience gives you insight that pure tech people lack: what actually works for learners.", howToGet: "Target EdTech companies like Pearson, Oak National, or Twinkl. Apply to product, content, or training roles." },
    { title: "HR / People Manager", salary: "£30,000 - £55,000", transition: "3-6 months", match: "80%", description: "Teachers manage people every day: students, parents, teaching assistants, external agencies. HR requires the same skills of empathy, communication, conflict resolution, and organisation.", howToGet: "CIPD Level 5 qualification (6-12 months part-time). Or start with HR admin roles and progress internally." },
    { title: "Project Manager", salary: "£32,000 - £65,000", transition: "2-4 months", match: "85%", description: "Planning a school year, coordinating trips, managing department budgets, and hitting Ofsted deadlines IS project management. You just called it teaching.", howToGet: "PRINCE2 Foundation (1 week, ~£500). Apply to any sector. Your organisational skills are immediately transferable." },
    { title: "UX Researcher", salary: "£30,000 - £55,000", transition: "3-6 months", match: "80%", description: "Conduct user research to improve digital products. Teachers understand how people learn, how to ask the right questions, and how to synthesise qualitative data. These are core UX research skills.", howToGet: "Google UX Design Certificate or bootcamp (12-16 weeks). Build 2-3 case studies. Target junior UX researcher roles." },
    { title: "Content Writer / Copywriter", salary: "£25,000 - £50,000", transition: "1-2 months", match: "85%", description: "Teachers are professional communicators who simplify complex ideas. Content writing requires exactly the same skill: making information clear, engaging, and accessible.", howToGet: "Build a portfolio of blog posts or articles. Start freelancing alongside teaching. Transition when income is stable." },
    { title: "Civil Service Fast Stream", salary: "£28,000 - £34,000 (starting)", transition: "3-6 months", match: "75%", description: "The Civil Service actively recruits career changers. Teachers' skills in analysis, communication, and stakeholder management align with policy, operational delivery, and project roles.", howToGet: "Apply via the Civil Service Jobs portal. Fast Stream applications open annually. Also direct-entry roles at EO/HEO level." },
    { title: "Sales / Account Management", salary: "£25,000 - £60,000+ (OTE)", transition: "1-3 months", match: "75%", description: "Teaching is persuasion. You sell concepts to reluctant audiences every day. Business sales requires the same presentation skills, resilience, and ability to read a room.", howToGet: "Apply directly. SaaS and EdTech sales roles value teaching backgrounds. Commission structures can significantly boost earnings." },
    { title: "Business Analyst", salary: "£30,000 - £55,000", transition: "3-6 months", match: "75%", description: "Analyse business processes and recommend improvements. Teachers already gather data, identify patterns, and design solutions. The analytical mindset transfers.", howToGet: "BCS Foundation Certificate in Business Analysis (1 week). Apply to consulting firms or internal BA teams." },
    { title: "Charity / Education Programme Manager", salary: "£28,000 - £48,000", transition: "1-2 months", match: "90%", description: "Manage educational programmes for charities, museums, or cultural organisations. Apply your teaching expertise in a less pressured environment with better work-life balance.", howToGet: "Search charity job boards (CharityJob, Third Sector Jobs). Your teaching experience is often the primary requirement." },
    { title: "Data Analyst", salary: "£25,000 - £50,000", transition: "3-6 months", match: "70%", description: "If you tracked student progress, analysed assessment data, and used spreadsheets to identify trends, you have performed basic data analysis. A structured learning path can take you further.", howToGet: "Google Data Analytics Certificate (6 months part-time). Learn SQL and basic Python. Build portfolio projects with education data." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Career Change From Teaching UK (2026)",
            description: "Guide for UK teachers exploring career changes with 12 realistic options and transition timelines.",
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
        {" / "}<span className="text-gray-600">From Teaching</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Career Change From Teaching: What Ex-Teachers Actually Do
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>13 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Leaving teaching is not giving up. According to the NEU, 44% of teachers plan to leave the profession within the next 5 years, citing workload, accountability pressure, and pay that has not kept pace with inflation. If you are among them, this guide is for you.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Here is what nobody tells you when you are inside the teaching bubble: your skills are exceptionally valuable outside education. Communication, stakeholder management, data analysis, programme design, presentation skills, and the ability to manage 30 unpredictable humans at once. Employers in every sector want these skills.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        The challenge is not that you lack skills. It is that you have never had to articulate them in non-teaching language. This guide helps you translate.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">44%</div>
          <div className="text-xs text-gray-500">Plan to leave teaching</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-xs text-gray-500">Careers listed here</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£65k+</div>
          <div className="text-xs text-gray-500">Top salary potential</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">1-6</div>
          <div className="text-xs text-gray-500">Months to transition</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your teaching skills are worth more than your teaching salary</div>
          <div className="text-sm text-gray-500">Upload your CV and see which careers match your specific teaching experience and subject expertise.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Skills Translation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translating your teaching skills</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Lesson planning", "Programme design / project planning"],
              ["Differentiation", "User-centred design / personalisation"],
              ["Marking and assessment", "Data analysis / quality assurance"],
              ["Parents' evenings", "Stakeholder management / client relations"],
              ["Behaviour management", "Conflict resolution / team management"],
              ["Ofsted preparation", "Compliance / audit readiness"],
              ["Department meetings", "Cross-functional collaboration"],
              ["School trips", "Event management / risk assessment"],
            ].map(([teaching, corporate]) => (
              <div key={teaching} className="flex items-center gap-2 py-1">
                <span className="text-gray-500">{teaching}</span>
                <span className="text-gray-400">&rarr;</span>
                <span className="font-medium text-indigo-600">{corporate}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Careers for Ex-Teachers</h2>
        <div className="space-y-5">
          {careers.map((career, idx) => (
            <div key={career.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">Transition: {career.transition}</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">Skill match: {career.match}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                <div>
                  <span className="text-xs font-semibold text-gray-500">How to get there</span>
                  <p className="text-sm text-gray-600 mt-1">{career.howToGet}</p>
                </div>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Every lesson you planned was project management</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI translates your teaching experience into corporate language and matches you to roles where your skills command higher salaries.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 8 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Teachers who move into L&D roles typically see a £10,000-£20,000 salary increase</span> while doing broadly similar work with significantly less stress.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your matches</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to see what your teaching experience qualifies you for?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and find out in 2 minutes &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your teaching career was training for what comes next</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover which careers value your teaching skills the most. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/careers-for/teachers" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Full Teachers Guide</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-from-nursing" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change From Nursing</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/how-to-write-a-cv-for-career-change" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change CV Guide</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for/teachers" className="text-sm text-indigo-600 hover:text-indigo-700">Careers for Teachers</Link>
        </div>
      </div>
    </div>
  );
}
