import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SkillPageData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  keySkills: string[];
  topJobs: { title: string; salary: string; match: string; why: string }[];
  surprisingJobs: { title: string; why: string }[];
  jsonLdSkills: string[];
}

const PAGES: Record<string, SkillPageData> = {
  "teaching-skills": {
    title: "Teaching Skills",
    metaTitle: "What Jobs Can I Get With Teaching Skills? | 10+ Career Matches",
    metaDescription: "Teaching builds powerful transferable skills. Discover 10+ careers that value your communication, curriculum design, and people development experience.",
    intro: "Teaching is one of the most skill-rich professions in the world. You may have searched for 'teacher' on job boards and found only more teaching roles. But your skills in communication, programme design, stakeholder management, and people development are exactly what dozens of other industries need. Here are the careers your teaching skills unlock.",
    keySkills: ["Public Speaking & Presentation", "Curriculum Design", "Team Leadership & Mentoring", "Stakeholder Management", "Data Analysis (student tracking)", "Behaviour Management", "Written Communication", "Event Planning", "Training Delivery", "Empathy & Emotional Intelligence"],
    topJobs: [
      { title: "Learning & Development Manager", salary: "£35k-£60k", match: "85-92%", why: "You already design learning experiences and measure their impact. Corporate L&D is the same skill in a different setting." },
      { title: "UX Researcher", salary: "£30k-£60k", match: "70-80%", why: "Teachers are expert observers and interviewers. You understand how different people think and process information." },
      { title: "Instructional Designer", salary: "£28k-£50k", match: "80-90%", why: "This is lesson planning for the digital world. Your curriculum design skills are the core requirement." },
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "65-75%", why: "You build trust with diverse audiences, communicate complex ideas simply, and genuinely care about outcomes." },
      { title: "Content Strategist", salary: "£28k-£55k", match: "65-75%", why: "English and humanities teachers have strong editorial instincts and storytelling ability." },
      { title: "Project Manager", salary: "£32k-£70k", match: "65-75%", why: "Running a department, organising school plays, and managing multiple classes IS project management." },
      { title: "HR Business Partner", salary: "£35k-£65k", match: "60-70%", why: "People management, conflict resolution, and mentoring are core HR skills you already have." },
      { title: "Scrum Master", salary: "£40k-£75k", match: "65-75%", why: "Facilitating learning, removing blockers, and coaching teams. Sound familiar?" },
    ],
    surprisingJobs: [
      { title: "Technical Writer", why: "English teachers excel at making complex information clear and accessible. Tech companies pay well for this." },
      { title: "Recruitment Consultant", why: "You assess people all day. Your ability to read situations and build rapport is exactly what recruitment needs." },
      { title: "Policy Analyst", why: "Research skills, writing ability, and understanding how systems work transfer directly to policy work." },
    ],
    jsonLdSkills: ["Teaching", "Public Speaking", "Curriculum Design", "Team Leadership", "Stakeholder Management"],
  },
  "project-management-skills": {
    title: "Project Management Skills",
    metaTitle: "What Jobs Can I Get With Project Management Skills? | Career Matches",
    metaDescription: "Project management skills are among the most transferable in any industry. Discover careers in tech, consulting, operations, and more.",
    intro: "If you can manage a project, you can manage almost anything. Project management skills, including planning, budgeting, stakeholder coordination, and risk management, are in demand across every industry. Whether your PM experience comes from construction, IT, events, or any other field, here is where those skills take you next.",
    keySkills: ["Planning & Scheduling", "Budget Management", "Risk Assessment", "Stakeholder Communication", "Team Coordination", "Problem Solving", "Scope Management", "Reporting & Documentation", "Change Management", "Quality Assurance"],
    topJobs: [
      { title: "Product Manager", salary: "£40k-£85k", match: "75-85%", why: "Product management is project management with a strategic lens. Your planning and stakeholder skills are the foundation." },
      { title: "Operations Manager", salary: "£35k-£70k", match: "80-90%", why: "Operational management is project management applied continuously. Your process thinking translates directly." },
      { title: "Scrum Master / Agile Coach", salary: "£40k-£75k", match: "75-85%", why: "Agile is a different framework for the same thing you do: delivering outcomes through coordinated teams." },
      { title: "Management Consultant", salary: "£35k-£100k", match: "70-80%", why: "Consultancies value your ability to structure problems, manage workstreams, and deliver under pressure." },
      { title: "Business Analyst", salary: "£30k-£60k", match: "70-80%", why: "Requirements gathering and process mapping are natural extensions of project scoping and planning." },
      { title: "Programme Manager", salary: "£50k-£90k", match: "85-95%", why: "The next step up. Managing multiple related projects and their interdependencies." },
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "65-75%", why: "Client project delivery, relationship management, and outcome tracking. Familiar territory." },
    ],
    surprisingJobs: [
      { title: "Event Manager", why: "Events are intense, short-lifecycle projects. Your planning and coordination skills are exactly what is needed." },
      { title: "Facilities Manager", why: "Building operations are ongoing projects. Budget, contractor, and compliance management translate directly." },
      { title: "Sustainability Consultant", why: "ESG programmes are complex, multi-stakeholder projects. Your structured approach is valuable." },
    ],
    jsonLdSkills: ["Project Management", "Budget Management", "Risk Assessment", "Stakeholder Management", "Team Leadership"],
  },
  "customer-service-skills": {
    title: "Customer Service Skills",
    metaTitle: "What Jobs Can I Get With Customer Service Skills? | Career Guide",
    metaDescription: "Customer service experience builds incredible people skills. Discover careers in sales, HR, recruitment, and more that pay significantly better.",
    intro: "Customer service experience is often undervalued on CVs, but the skills you develop are among the most transferable in the workforce. Empathy, conflict resolution, problem solving under pressure, and clear communication are skills that many office workers never develop. Here is where those skills command a higher salary.",
    keySkills: ["Active Listening", "Conflict Resolution", "Problem Solving Under Pressure", "Clear Communication", "Empathy", "Multitasking", "Patience", "Product Knowledge", "CRM Systems", "Team Collaboration"],
    topJobs: [
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "80-90%", why: "This is customer service at a strategic level. B2B companies pay significantly more for your people skills." },
      { title: "Recruitment Consultant", salary: "£22k-£60k+", match: "70-80%", why: "You read people, handle objections, and build rapport quickly. Recruitment agencies hire from customer service constantly." },
      { title: "Business Development Manager", salary: "£28k-£80k+", match: "65-75%", why: "Sales is customer service with revenue targets. Your objection handling skills translate directly." },
      { title: "HR Business Partner", salary: "£35k-£65k", match: "60-70%", why: "Employee relations requires the same empathy, conflict resolution, and communication skills." },
      { title: "Executive Assistant", salary: "£28k-£50k", match: "70-80%", why: "Supporting senior leaders requires the same service mindset, anticipation, and communication skills." },
      { title: "Estate Agent", salary: "£20k-£50k+", match: "70-80%", why: "Property is a people business. Your relationship skills and sales ability drive success." },
    ],
    surprisingJobs: [
      { title: "UX Researcher", why: "Customer service reps understand user frustrations better than anyone. That insight is gold in UX research." },
      { title: "Community Manager", why: "Managing online communities is digital customer service. Your de-escalation skills are essential." },
      { title: "Charity Fundraiser", why: "Relationship building and persuasion in the service of a cause you believe in." },
    ],
    jsonLdSkills: ["Customer Service", "Communication", "Conflict Resolution", "Problem Solving", "Empathy"],
  },
  "nursing-skills": {
    title: "Nursing Skills",
    metaTitle: "What Jobs Can I Get With Nursing Skills? | Career Change Guide",
    metaDescription: "Nursing develops extraordinary transferable skills. Discover 10+ careers that value your clinical, leadership, and crisis management experience.",
    intro: "Nurses develop some of the strongest transferable skills of any profession. You make critical decisions under pressure, manage complex stakeholder relationships, handle sensitive information, and demonstrate extraordinary empathy. These skills are in huge demand beyond the clinical setting.",
    keySkills: ["Clinical Assessment", "Crisis Management", "Empathy & Patient Communication", "Team Coordination", "Record Keeping & Compliance", "Health & Safety", "Medication Management", "Multi-tasking Under Pressure", "Safeguarding", "Training & Mentoring"],
    topJobs: [
      { title: "Healthcare Manager", salary: "£35k-£65k", match: "80-90%", why: "Clinical credibility combined with management skills is rare and extremely valuable." },
      { title: "Clinical Trials Coordinator", salary: "£28k-£45k", match: "75-85%", why: "Your clinical knowledge, patient communication, and protocol adherence are exactly what research needs." },
      { title: "Health & Safety Officer", salary: "£28k-£55k", match: "70-80%", why: "Risk assessment is second nature. Infection control and safety protocols are your daily routine." },
      { title: "Pharmaceutical Sales", salary: "£30k-£55k + commission", match: "65-75%", why: "You speak healthcare. Doctors trust clinical professionals more than pure salespeople." },
      { title: "Counsellor", salary: "£25k-£50k", match: "70-80%", why: "Your empathy, active listening, and experience with vulnerable people are the foundation of therapy." },
      { title: "Medical Writer", salary: "£30k-£55k", match: "65-75%", why: "Clinical knowledge plus writing ability. A rare and valued combination." },
    ],
    surprisingJobs: [
      { title: "UX Researcher", why: "Nurses are expert observers and interviewers. Understanding patient needs is understanding user needs." },
      { title: "Insurance Underwriter", why: "Your clinical knowledge helps assess health risks accurately. Insurers value this expertise." },
      { title: "Data Analyst (Healthcare)", why: "You understand clinical data. With SQL skills added, healthcare analytics is a natural fit." },
    ],
    jsonLdSkills: ["Patient Care", "Clinical Assessment", "Crisis Management", "Health and Safety", "Team Leadership"],
  },
  "sales-skills": {
    title: "Sales Skills",
    metaTitle: "What Jobs Can I Get With Sales Skills? | High-Paying Career Matches",
    metaDescription: "Sales skills are among the most transferable and highest-paid. Discover careers in management, consulting, recruitment, and entrepreneurship.",
    intro: "Sales experience teaches you skills that most people never develop: persuasion, resilience, negotiation, and the ability to build relationships quickly. These are the skills that drive business growth in every industry. Here is where your sales skills command top salaries.",
    keySkills: ["Negotiation", "Persuasion & Influence", "Relationship Building", "Target Management", "Objection Handling", "Presentation Skills", "CRM Systems", "Pipeline Management", "Competitive Analysis", "Resilience"],
    topJobs: [
      { title: "Business Development Manager", salary: "£28k-£80k+", match: "85-95%", why: "Bigger deals, bigger companies, bigger commissions. Your sales engine in a strategic wrapper." },
      { title: "Recruitment Consultant", salary: "£22k-£60k+", match: "80-90%", why: "Recruitment IS sales. Selling candidates to clients and roles to candidates." },
      { title: "Management Consultant", salary: "£35k-£100k", match: "65-75%", why: "Business development for consultancies requires exactly your relationship and pitch skills." },
      { title: "Product Manager", salary: "£40k-£85k", match: "60-70%", why: "Product managers sell internally: pitching features, influencing engineering, managing stakeholders." },
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "75-85%", why: "Expansion revenue and upselling are sales in a relationship context. Your natural habitat." },
      { title: "Estate Agent", salary: "£20k-£50k+", match: "80-90%", why: "High-value sales with relationship depth. Your closing skills transfer immediately." },
    ],
    surprisingJobs: [
      { title: "Charity Fundraiser", why: "Major donor fundraising is consultative selling for a cause. Very rewarding career change." },
      { title: "PR Manager", why: "Selling stories to journalists requires the same pitch and relationship skills." },
      { title: "Event Manager", why: "Selling sponsorships and managing vendor relationships. Commercial skills drive success." },
    ],
    jsonLdSkills: ["Sales", "Negotiation", "Business Development", "Relationship Management", "Persuasion"],
  },
};

// Add remaining slugs with shorter data
const SIMPLE_PAGES: Record<string, { title: string; metaTitle: string; metaDescription: string }> = {
  "admin-skills": { title: "Admin Skills", metaTitle: "What Jobs Can I Get With Admin Skills? | Career Matches", metaDescription: "Admin experience builds strong organisational, communication, and stakeholder management skills. Discover roles that pay more." },
  "management-skills": { title: "Management Skills", metaTitle: "What Jobs Can I Get With Management Skills? | Career Guide", metaDescription: "Management experience is highly transferable. Discover careers in consulting, operations, and leadership." },
  "writing-skills": { title: "Writing Skills", metaTitle: "What Jobs Can I Get With Writing Skills? | Career Matches", metaDescription: "Strong writing opens doors to content strategy, copywriting, UX writing, PR, and more. Discover your matches." },
  "data-analysis-skills": { title: "Data Analysis Skills", metaTitle: "What Jobs Can I Get With Data Analysis Skills? | Career Guide", metaDescription: "Data skills are in massive demand. Discover careers in data science, business intelligence, and analytics." },
  "creative-skills": { title: "Creative Skills", metaTitle: "What Jobs Can I Get With Creative Skills? | Career Matches", metaDescription: "Creative skills transfer to UX design, brand strategy, content marketing, and more." },
  "construction-skills": { title: "Construction Skills", metaTitle: "What Jobs Can I Get With Construction Skills? | Corporate Careers", metaDescription: "Construction experience builds exceptional project management and leadership skills. See corporate matches." },
  "military-skills": { title: "Military Skills", metaTitle: "What Jobs Can I Get With Military Skills? | Civilian Careers", metaDescription: "Military service develops world-class leadership and planning skills. Discover civilian career matches." },
  "accounting-skills": { title: "Accounting Skills", metaTitle: "What Jobs Can I Get With Accounting Skills? | Career Options", metaDescription: "Accounting skills open doors to data analysis, consulting, compliance, and fintech." },
  "caring-skills": { title: "Caring & Parenting Skills", metaTitle: "What Jobs Can I Get After a Career Break? | Skills Matcher", metaDescription: "Career breaks build real skills. Discover jobs that value your project management, budgeting, and people skills." },
  "it-support-skills": { title: "IT Support Skills", metaTitle: "What Jobs Can I Get With IT Support Skills? | Tech Careers", metaDescription: "IT support experience leads to cybersecurity, DevOps, solutions architecture, and more." },
  "retail-skills": { title: "Retail Skills", metaTitle: "What Jobs Can I Get With Retail Skills? | Higher Paying Careers", metaDescription: "Retail experience builds strong sales, people, and operations skills. Discover higher-paying career matches." },
};

export function generateStaticParams() {
  return [
    ...Object.keys(PAGES),
    ...Object.keys(SIMPLE_PAGES),
  ].map((query) => ({ query }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}): Promise<Metadata> {
  const { query } = await params;
  const full = PAGES[query];
  if (full) return { title: full.metaTitle, description: full.metaDescription };
  const simple = SIMPLE_PAGES[query];
  if (simple) return { title: simple.metaTitle, description: simple.metaDescription };
  return { title: "Not Found" };
}

export default async function WhatJobsDetailPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const data = PAGES[query];
  const simple = SIMPLE_PAGES[query];

  if (!data && !simple) notFound();

  // For simple pages, redirect to the discover tool with a CTA
  if (!data && simple) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-sm text-gray-400 mb-6">
          <Link href="/what-jobs" className="hover:text-indigo-600">What Jobs Can I Get</Link>
          {" / "}<span className="text-gray-600">{simple.title}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          What Jobs Can I Get With {simple.title}?
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {simple.title} are highly transferable across many industries. Rather than showing you generic matches, our AI can analyse YOUR specific experience and find careers personalised to you.
        </p>
        <div className="bg-indigo-50 rounded-xl p-8 text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Get your personalised career matches</h2>
          <p className="text-gray-500 mb-6">Upload your CV or describe your experience. Our AI will extract your specific skills and match you to careers you never considered.</p>
          <Link href="/discover" className="inline-flex items-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Analyse My Skills Free
          </Link>
        </div>
        <div className="text-center">
          <Link href="/what-jobs" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Browse all skill categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: data.metaTitle,
            description: data.metaDescription,
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            about: data.jsonLdSkills.map((s) => ({ "@type": "DefinedTerm", name: s })),
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/what-jobs" className="hover:text-indigo-600">What Jobs Can I Get</Link>
        {" / "}<span className="text-gray-600">{data.title}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
        What Jobs Can I Get With {data.title}?
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-10">{data.intro}</p>

      {/* Inline CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Want personalised results?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your specific experience to careers.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My CV Free
        </Link>
      </div>

      {/* Key Skills */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Key Transferable Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.keySkills.map((skill) => (
            <span key={skill} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Top Jobs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Top Career Matches for {data.title}
        </h2>
        <div className="space-y-4">
          {data.topJobs.map((job, i) => (
            <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-gray-400 mr-2">#{i + 1}</span>
                  <span className="font-semibold text-gray-900">{job.title}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-sm font-bold text-green-600">{job.match}</div>
                  <div className="text-xs text-gray-400">{job.salary}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{job.why}</p>
              <Link
                href={`/jobs?q=${encodeURIComponent(job.title)}`}
                className="inline-block mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-700"
              >
                Search {job.title} jobs
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Inline CTA 2 */}
      <div className="bg-gray-900 text-white rounded-xl p-6 mb-10 text-center">
        <h3 className="text-lg font-semibold mb-2">These are general matches.</h3>
        <p className="text-gray-300 text-sm mb-4">For results specific to YOUR experience, let our AI analyse your CV in 2 minutes.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Get My Personalised Matches
        </Link>
      </div>

      {/* Surprising Jobs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Careers You Might Not Have Considered
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {data.surprisingJobs.map((job) => (
            <div key={job.title} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="font-semibold text-gray-900 mb-1">{job.title}</div>
              <p className="text-xs text-gray-600">{job.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Ready to find your perfect match?
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Our AI analyses your specific experience, not just generic skills. Upload your CV or describe what you have done and get personalised career matches in 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Discover My Career Matches
          </Link>
          <Link href="/what-jobs" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">
            Browse Other Skills
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/careers-for" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change by Profession</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change Guides</Link>
          <span className="text-gray-300">|</span>
          <Link href="/pricing" className="text-sm text-indigo-600 hover:text-indigo-700">Pricing</Link>
        </div>
      </div>
    </div>
  );
}
