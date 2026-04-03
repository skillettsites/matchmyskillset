import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adult Apprenticeships UK (2026) | Over 25s Guide",
  description:
    "Complete guide to adult apprenticeships in the UK. No age limit, earn while you learn, and gain degree-level qualifications debt-free. Programmes, salaries, and how to apply.",
  keywords: [
    "adult apprenticeships UK",
    "apprenticeships for over 25s",
    "apprenticeship age limit UK",
    "adult learning UK",
    "earn while you learn over 25",
    "degree apprenticeship adults",
  ],
  openGraph: {
    title: "Adult Apprenticeships UK (2026)",
    description: "Earn while you learn at any age. Degree-level qualifications with no debt.",
    type: "article",
  },
};

export default function AdultApprenticeshipsPage() {
  const apprenticeships = [
    { title: "Software Developer (Level 4)", salary: "£18,000 - £28,000 during", duration: "18-24 months", qualification: "Higher Technical Certificate", career: "Software Developer (£30k-75k)" },
    { title: "Data Analyst (Level 4)", salary: "£18,000 - £25,000 during", duration: "18-24 months", qualification: "Higher Technical Certificate", career: "Data Analyst (£25k-55k)" },
    { title: "Cybersecurity Technologist (Level 4)", salary: "£20,000 - £28,000 during", duration: "24 months", qualification: "Higher Technical Certificate", career: "Cybersecurity Analyst (£30k-65k)" },
    { title: "Digital Marketing (Level 3)", salary: "£16,000 - £22,000 during", duration: "15-18 months", qualification: "Digital Marketing Certificate", career: "Marketing Manager (£28k-55k)" },
    { title: "Project Manager (Level 4)", salary: "£20,000 - £30,000 during", duration: "18-24 months", qualification: "Associate Project Manager", career: "Project Manager (£32k-65k)" },
    { title: "Accounting (Level 7)", salary: "£22,000 - £30,000 during", duration: "36-48 months", qualification: "ACCA / CIMA equivalent", career: "Accountant (£30k-70k)" },
    { title: "Nursing Associate (Level 5)", salary: "£20,000 - £25,000 during", duration: "24 months", qualification: "Foundation Degree", career: "Registered Nurse (£27k-44k)" },
    { title: "Police Constable (PCDA)", salary: "£23,556 during", duration: "36 months", qualification: "Degree in Professional Policing", career: "Police Officer (£28k-44k+)" },
    { title: "Chartered Manager (Level 6)", salary: "£25,000 - £35,000 during", duration: "36-48 months", qualification: "BSc/BA equivalent + CMI", career: "Senior Manager (£40k-70k)" },
    { title: "Electrician (Level 3)", salary: "£14,000 - £22,000 during", duration: "36-48 months", qualification: "NVQ Level 3", career: "Electrician (£30k-55k+)" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Adult Apprenticeships UK (2026) Guide",
            description: "Complete guide to adult apprenticeships with no age limit, salary data, and application process.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Adult Apprenticeships UK</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Adult Apprenticeships in the UK: The Complete Guide
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        There is no age limit on apprenticeships in the UK. That fact surprises most people. Whether you are 25, 35, 45, or 55, you can start an apprenticeship, earn a salary while you learn, and gain qualifications up to degree level without paying a penny in tuition fees.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The Apprenticeship Levy means large employers pay into a fund specifically to train apprentices. The government covers 95% of training costs for smaller employers. This money goes unspent every year because not enough people apply. The opportunity is genuinely under-used.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        In 2025-26, 27% of all apprenticeship starts were by people aged 25 or over. You are not unusual. You are joining a well-established route.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">No</div>
          <div className="text-xs text-gray-500">Age limit</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£0</div>
          <div className="text-xs text-gray-500">Tuition fees</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">27%</div>
          <div className="text-xs text-gray-500">Starts are 25+</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">Level 7</div>
          <div className="text-xs text-gray-500">Up to Masters equivalent</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Not sure which apprenticeship suits your skills?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your existing experience to apprenticeship routes and career outcomes.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How Adult Apprenticeships Work</h2>
        <div className="space-y-4">
          {[
            { q: "What are the levels?", a: "Level 2 (GCSE equivalent) through Level 7 (Masters equivalent). Higher apprenticeships (Level 4-5) and degree apprenticeships (Level 6-7) are most relevant for adults with existing experience." },
            { q: "How much do you earn?", a: "The minimum apprenticeship wage is £6.40/hour, but most adult apprenticeships pay significantly more: £18,000-£30,000 depending on level and employer. Degree apprenticeships at large companies can pay £25,000+." },
            { q: "How much time is studying vs working?", a: "Typically 80% working, 20% studying. You spend most of your time doing the actual job, with one day per week (or equivalent) dedicated to off-the-job training." },
            { q: "Who pays for the training?", a: "Not you. Large employers pay through the Apprenticeship Levy. Small employers pay just 5% of training costs (government covers 95%). You pay nothing." },
            { q: "Can I do it part-time?", a: "Some apprenticeships offer part-time options, typically extending the duration accordingly. Ask specific employers about flexibility." },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apprenticeship listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">10 Popular Adult Apprenticeships</h2>
        <div className="space-y-5">
          {apprenticeships.map((a, idx) => (
            <div key={a.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{a.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-xs font-semibold text-green-700">Salary during</div>
                    <div className="text-xs text-green-800">{a.salary}</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2 text-center">
                    <div className="text-xs font-semibold text-indigo-700">Duration</div>
                    <div className="text-xs text-indigo-800">{a.duration}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <div className="text-xs font-semibold text-amber-700">Qualification</div>
                    <div className="text-xs text-amber-800">{a.qualification}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <div className="text-xs font-semibold text-purple-700">Career outcome</div>
                    <div className="text-xs text-purple-800">{a.career}</div>
                  </div>
                </div>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Earn a degree without the debt</h3>
                  <p className="text-gray-300 text-sm mb-4">Degree apprenticeships give you a full degree plus 3-4 years of workplace experience, with zero tuition fees. Our AI matches your skills to the best route.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 7 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Billions of pounds of Apprenticeship Levy funding goes unused every year.</span> Employers want adult apprentices but cannot find enough applicants.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See which apprenticeships match your skills</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How to apply */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Find and Apply</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">gov.uk/apply-apprenticeship</h3>
            <p className="text-sm text-gray-600">The official government portal. Search by keyword, location, and level. Set up alerts for new listings in your area.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Employer careers pages</h3>
            <p className="text-sm text-gray-600">Large employers (BT, BAE Systems, NHS, Deloitte, Rolls-Royce) list apprenticeships directly. Check their careers pages and follow them on LinkedIn.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Training providers</h3>
            <p className="text-sm text-gray-600">Providers like QA, Multiverse, and Corndel connect you with employers offering apprenticeships. Register with them directly.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Your current employer</h3>
            <p className="text-sm text-gray-600">Ask your HR department. Many employers can upskill existing employees through apprenticeships funded by the Levy. You keep your salary and gain a qualification.</p>
          </div>
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Not sure which route suits you?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and explore your options &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Find the right apprenticeship for you</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover which apprenticeships and career paths match your existing skills. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs-that-dont-require-a-degree" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs Without a Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs No Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
        </div>
      </div>
    </div>
  );
}
