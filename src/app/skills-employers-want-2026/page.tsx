import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Skills Employers Want in 2026 UK | Most In-Demand Skills",
  description:
    "The most in-demand skills UK employers are hiring for in 2026. Technical, soft, and emerging skills with salary premiums. Data from LinkedIn, Indeed, and government reports.",
  keywords: [
    "most in demand skills 2026 UK",
    "skills employers are looking for",
    "top skills 2026",
    "in demand skills UK",
    "skills gap UK",
    "employable skills 2026",
  ],
  openGraph: {
    title: "Skills Employers Want in 2026 UK",
    description: "The most in-demand skills in the UK job market with salary premiums and how to develop them.",
    type: "article",
  },
};

export default function SkillsEmployersWantPage() {
  const technicalSkills = [
    { skill: "AI / Machine Learning", salaryPremium: "+35-50%", demand: "Very High", description: "Understanding how to use, implement, or manage AI tools. Not just building AI, but knowing how to apply it in business contexts. Every sector is hiring for this.", howToLearn: "Google AI Essentials (free), DeepLearning.AI courses on Coursera, hands-on projects with ChatGPT API or Python." },
    { skill: "Cloud Computing (AWS/Azure)", salaryPremium: "+25-40%", demand: "Very High", description: "AWS and Azure skills are among the most consistently sought-after in the UK tech market. Certified professionals earn significantly more than non-certified peers.", howToLearn: "AWS Cloud Practitioner certification (20-40 hours study). Free tier AWS account for practice. Then Solutions Architect." },
    { skill: "Cybersecurity", salaryPremium: "+20-35%", demand: "Very High", description: "The UK has 14,000 unfilled cybersecurity roles. Demand outstrips supply by a wide margin. Even basic security awareness training makes you more employable.", howToLearn: "CompTIA Security+ or ISC2 Certified in Cybersecurity. TryHackMe for hands-on practice. Government-funded bootcamps available." },
    { skill: "Data Analysis (SQL, Python, Excel)", salaryPremium: "+15-30%", demand: "High", description: "Every organisation generates more data than it can analyse. SQL and Excel are baseline requirements. Python and visualisation tools (Power BI, Tableau) push you into higher brackets.", howToLearn: "Google Data Analytics Certificate (6 months). SQL practice on SQLZoo. Python basics on freeCodeCamp." },
    { skill: "Digital Marketing (SEO, PPC, Analytics)", salaryPremium: "+10-25%", demand: "High", description: "Businesses continue to shift budget from traditional to digital marketing. Understanding SEO, paid advertising, and analytics is valuable across almost every industry.", howToLearn: "Google Ads and Analytics certifications (free). HubSpot Academy (free). Practical experience through personal or volunteer projects." },
  ];

  const softSkills = [
    { skill: "Communication", salaryPremium: "+10-20%", demand: "Universal", description: "The ability to write clearly, present confidently, and explain complex ideas simply. The most consistently cited skill in job descriptions across all industries.", howToLearn: "Practice through blogging, presentations, or Toastmasters. Read 'Made to Stick' by Chip and Dan Heath." },
    { skill: "Problem-Solving", salaryPremium: "+15-25%", demand: "Universal", description: "Structured analytical thinking applied to novel challenges. Not just identifying problems but designing and implementing solutions. The #1 skill employers say candidates lack.", howToLearn: "Practice structured problem-solving frameworks (MECE, root cause analysis). Case study practice. Real-world project experience." },
    { skill: "Adaptability", salaryPremium: "+10-20%", demand: "Very High", description: "The pace of change in business means employers need people who can adjust quickly. Adaptability is now listed in 45% more UK job descriptions than in 2020.", howToLearn: "Demonstrate through career history: different roles, industries, or contexts. Highlight examples of handling change in interviews." },
    { skill: "Leadership / People Management", salaryPremium: "+20-40%", demand: "High", description: "Leading teams, coaching individuals, and driving performance. Not just management by title, but the ability to influence, motivate, and develop others.", howToLearn: "CMI management qualification. Mentoring others. Volunteer leadership roles. Reading: 'The Making of a Manager' by Julie Zhuo." },
    { skill: "Emotional Intelligence", salaryPremium: "+15-25%", demand: "Growing", description: "Understanding and managing your own emotions while reading others'. Increasingly recognised as the differentiator between good and exceptional professionals.", howToLearn: "Self-awareness practice. Feedback from colleagues. Read 'Emotional Intelligence' by Daniel Goleman. Coaching or therapy." },
  ];

  const emergingSkills = [
    { skill: "AI Prompt Engineering", salaryPremium: "New category", demand: "Rapidly Growing", description: "The ability to get effective outputs from AI tools. Not building AI, but using it efficiently. Already appearing in job descriptions across marketing, tech, and operations." },
    { skill: "Sustainability / ESG", salaryPremium: "+15-25%", demand: "Growing Fast", description: "Understanding environmental regulations, ESG reporting, and sustainable business practices. Becoming mandatory as UK regulations tighten." },
    { skill: "Data Storytelling", salaryPremium: "+15-20%", demand: "Growing", description: "Not just analysing data but communicating insights compellingly. The bridge between data science and business decision-making." },
    { skill: "No-Code / Low-Code Development", salaryPremium: "+10-20%", demand: "Growing", description: "Building apps and automations without traditional coding. Tools like Bubble, Airtable, and Zapier enable non-technical people to build powerful solutions." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Skills Employers Want in 2026 UK",
            description: "The most in-demand technical, soft, and emerging skills in the UK job market.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Skills Employers Want 2026</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Skills Employers Want in 2026 (UK)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        The UK skills gap is worth £39 billion. That gap is not just technical; employers report shortages in communication, problem-solving, and adaptability just as loudly as they report shortages in coding or data analysis. Understanding which skills carry the highest salary premiums helps you invest your development time wisely.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This analysis draws on data from LinkedIn's 2026 Skills Report, Indeed hiring trends, the CBI Education and Skills Survey, and government labour market statistics.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">£39bn</div>
          <div className="text-xs text-gray-500">UK skills gap value</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">+50%</div>
          <div className="text-xs text-gray-500">Top salary premium (AI)</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">76%</div>
          <div className="text-xs text-gray-500">Employers: skills over degrees</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">14,000</div>
          <div className="text-xs text-gray-500">Unfilled cyber roles</div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Which of these skills do you already have?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will map your existing skills against the most in-demand competencies.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Technical Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills (Highest Salary Premiums)</h2>
        <div className="space-y-5">
          {technicalSkills.map((s, idx) => (
            <div key={s.skill}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{s.skill}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{s.salaryPremium}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                  Demand: {s.demand}
                </div>
                <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                <div>
                  <span className="text-xs font-semibold text-gray-500">How to develop</span>
                  <p className="text-sm text-gray-600 mt-1">{s.howToLearn}</p>
                </div>
              </div>

              {idx === 2 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">You probably have more of these skills than you think</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI identifies skills you use daily that you have never thought to list. Upload your CV and see how your skills map to what employers want.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Soft Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Soft Skills (Consistently Most Requested)</h2>
        <div className="space-y-5">
          {softSkills.map((s) => (
            <div key={s.skill} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{s.skill}</h3>
                <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{s.salaryPremium}</span>
              </div>
              <div className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium mb-3">
                Demand: {s.demand}
              </div>
              <p className="text-sm text-gray-600 mb-3">{s.description}</p>
              <div>
                <span className="text-xs font-semibold text-gray-500">How to develop</span>
                <p className="text-sm text-gray-600 mt-1">{s.howToLearn}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The most valuable employees combine technical and soft skills.</span> A data analyst who can present findings compellingly earns 20% more than one who cannot.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See how your skills stack up</Link>.
        </p>
      </div>

      {/* Emerging Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emerging Skills (Watch These)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {emergingSkills.map((s) => (
            <div key={s.skill} className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-1">{s.skill}</h3>
              <div className="text-xs text-purple-600 font-medium mb-2">Premium: {s.salaryPremium} | Demand: {s.demand}</div>
              <p className="text-sm text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Want to see how your skills compare?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV for a free skills analysis &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Find out which in-demand skills you already have</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and our AI will map your existing skills to the most in-demand competencies. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/best-careers-for-the-future-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Best Careers for the Future</Link>
          <span className="text-gray-300">|</span>
          <Link href="/highest-paying-remote-jobs-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Highest Paying Remote Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/apprenticeships-for-adults-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Adult Apprenticeships</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
        </div>
      </div>
    </div>
  );
}
