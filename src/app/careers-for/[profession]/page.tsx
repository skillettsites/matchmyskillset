import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProfessionData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  transferableSkills: string[];
  careerPaths: {
    title: string;
    matchPercent: string;
    salary: string;
    description: string;
    whyItFits: string;
    gapToClose: string;
  }[];
  successStory?: { quote: string; name: string; transition: string };
  ctaText: string;
}

const PROFESSION_DATA: Record<string, ProfessionData> = {
  teachers: {
    title: "Teachers",
    metaTitle: "Career Change for Teachers - Jobs That Match Your Skills",
    metaDescription: "Thinking of leaving teaching? Discover careers that value your communication, leadership, and training skills. L&D Manager, UX Researcher, and more.",
    intro: "Teaching is one of the most skill-rich professions. After years managing classrooms, designing curricula, engaging stakeholders, and developing young people, you have built an extraordinary transferable skillset. The challenge is that most job boards only show you more teaching jobs. We show you what else those skills unlock.",
    transferableSkills: ["Public Speaking & Presentation", "Curriculum & Programme Design", "Team Leadership & Mentoring", "Stakeholder Management (parents, governors, Ofsted)", "Data Analysis (tracking student progress)", "Conflict Resolution & Behaviour Management", "Time Management Under Pressure", "Adapting to Different Learning Styles", "Written Communication", "Event Planning & Organisation"],
    careerPaths: [
      { title: "Learning & Development Manager", matchPercent: "85-92%", salary: "£35,000 - £60,000", description: "Design and deliver training programmes for employees. Your curriculum design and facilitation skills transfer directly.", whyItFits: "You already design learning experiences and measure outcomes. Corporate L&D is the same skill applied to adults.", gapToClose: "Learn about LMS platforms and corporate training methodologies. CIPD L&D qualification helps." },
      { title: "UX Researcher", matchPercent: "70-80%", salary: "£30,000 - £60,000", description: "Research user needs through interviews, surveys, and testing to inform product design.", whyItFits: "Teachers are expert interviewers and observers. You understand how different people think and learn.", gapToClose: "Learn UX research methods and tools (Figma, Miro). A UX bootcamp like CareerFoundry takes 6 months." },
      { title: "Instructional Designer", matchPercent: "80-90%", salary: "£28,000 - £50,000", description: "Create engaging online and blended learning content for courses and training programmes.", whyItFits: "This is curriculum design for the digital world. Your lesson planning skills are the core requirement.", gapToClose: "Learn e-learning authoring tools (Articulate, Adobe Captivate). Most teachers pick this up quickly." },
      { title: "Customer Success Manager", matchPercent: "65-75%", salary: "£30,000 - £60,000", description: "Ensure clients achieve their goals with a product or service. Build relationships and reduce churn.", whyItFits: "You are trained to understand diverse needs, communicate complex ideas simply, and build trust.", gapToClose: "Learn about SaaS products and CRM systems. Your people skills already exceed most candidates." },
      { title: "Content Strategist", matchPercent: "65-75%", salary: "£28,000 - £55,000", description: "Plan and create content across platforms to engage audiences and support business goals.", whyItFits: "English and humanities teachers are natural content creators with strong editorial instincts.", gapToClose: "Learn SEO, content management systems, and digital marketing basics. Your writing is already strong." },
    ],
    successStory: { quote: "I spent 10 years teaching English. I had no idea my skills in curriculum design and stakeholder management were exactly what tech companies need. Within 4 months of retraining, I landed an L&D role paying 15k more than teaching.", name: "Sarah", transition: "Teacher to L&D Manager" },
    ctaText: "Find out which careers match YOUR teaching skills",
  },
  nurses: {
    title: "Nurses & Healthcare Workers",
    metaTitle: "Career Change for Nurses - Jobs That Value Your Clinical Skills",
    metaDescription: "Thinking of leaving nursing? Your empathy, clinical assessment, and crisis management skills are highly valued in many industries. Explore your options.",
    intro: "Healthcare workers develop some of the strongest transferable skills of any profession. You make life-critical decisions under pressure, manage complex stakeholder relationships, handle sensitive information, and demonstrate extraordinary empathy. These skills are in huge demand beyond the clinical setting.",
    transferableSkills: ["Patient Assessment & Clinical Judgement", "Crisis Management & Staying Calm Under Pressure", "Empathy & Emotional Intelligence", "Team Coordination & Handover Communication", "Record Keeping & Compliance", "Health & Safety Expertise", "Medication Management & Attention to Detail", "Multi-tasking in High-Pressure Environments", "Safeguarding & Vulnerable Adult Awareness", "Training & Mentoring Junior Staff"],
    careerPaths: [
      { title: "Healthcare Manager", matchPercent: "80-90%", salary: "£35,000 - £65,000", description: "Manage healthcare services, teams, and budgets. Drive quality improvement and patient outcomes.", whyItFits: "You understand the system from the inside. Clinical credibility combined with management skills is rare and valuable.", gapToClose: "NHS Graduate Management Training Scheme or a health management qualification." },
      { title: "Clinical Trials Coordinator", matchPercent: "75-85%", salary: "£28,000 - £45,000", description: "Coordinate clinical research studies, manage participants, ensure regulatory compliance.", whyItFits: "Your clinical knowledge, patient communication, and attention to protocol are exactly what research teams need.", gapToClose: "GCP (Good Clinical Practice) certification. Many nurses transition into this directly." },
      { title: "Health & Safety Officer", matchPercent: "70-80%", salary: "£28,000 - £55,000", description: "Ensure workplace safety compliance, conduct risk assessments, develop safety training.", whyItFits: "Risk assessment is second nature to you. Infection control and safety protocols are your daily routine.", gapToClose: "NEBOSH qualification is the standard. Your healthcare background gives you a significant advantage." },
      { title: "Pharmaceutical Sales Representative", matchPercent: "65-75%", salary: "£30,000 - £55,000 + commission", description: "Sell pharmaceutical products to healthcare professionals. Combine clinical knowledge with sales.", whyItFits: "You speak the language of healthcare. Doctors trust clinical professionals more than pure salespeople.", gapToClose: "Sales training. Your clinical credibility is your biggest asset and cannot be taught." },
      { title: "Counsellor / Therapist", matchPercent: "70-80%", salary: "£25,000 - £50,000", description: "Provide therapeutic support to individuals dealing with mental health, grief, or life challenges.", whyItFits: "Your empathy, active listening, and experience with vulnerable people are the foundation of therapy.", gapToClose: "Counselling qualification (diploma or degree). Many can be done part-time alongside clinical work." },
    ],
    ctaText: "Find out which careers match YOUR healthcare skills",
  },
  construction: {
    title: "Construction & Trades",
    metaTitle: "Career Change from Construction - Corporate Jobs for Tradespeople",
    metaDescription: "Construction experience builds exceptional project management, budget control, and leadership skills. Discover corporate roles that value your background.",
    intro: "Construction professionals run complex projects with tight deadlines, manage large budgets, coordinate multiple teams, and navigate strict regulatory requirements. These are exactly the skills that corporate employers struggle to find. The transition from site to office is more natural than you think.",
    transferableSkills: ["Project Management (budgets, timelines, resources)", "Team Leadership & Coordination", "Health & Safety Management", "Budget Control & Cost Estimation", "Contract Negotiation & Subcontractor Management", "Risk Assessment & Mitigation", "Regulatory Compliance (Building Regs, CDM)", "Problem Solving Under Pressure", "Client Relationship Management", "Reading & Interpreting Technical Specifications"],
    careerPaths: [
      { title: "Operations Manager", matchPercent: "80-90%", salary: "£35,000 - £70,000", description: "Oversee daily business operations, manage teams, optimise processes.", whyItFits: "Running a construction site IS operations management. You have been doing this for years, just in a different setting.", gapToClose: "Minimal. Your experience translates directly. Frame your CV around outcomes and team sizes." },
      { title: "Project Manager (Corporate)", matchPercent: "85-92%", salary: "£32,000 - £70,000", description: "Plan and deliver projects on time and within budget across any industry.", whyItFits: "PRINCE2 or APM certification formalises what you already do. Construction PMs are highly respected.", gapToClose: "PRINCE2 Practitioner or APM qualification. Takes 1-2 weeks of training." },
      { title: "Facilities Manager", matchPercent: "80-88%", salary: "£30,000 - £55,000", description: "Manage building operations, maintenance, health & safety, and contractor relationships.", whyItFits: "You understand buildings, regulations, contractors, and budgets. This is your world in a corporate wrapper.", gapToClose: "IWFM qualification helpful but not essential. Your practical knowledge is the main requirement." },
      { title: "Health & Safety Officer", matchPercent: "75-85%", salary: "£28,000 - £55,000", description: "Ensure workplace safety compliance across any industry, not just construction.", whyItFits: "Construction H&S is the most rigorous in any industry. Every other sector is easier by comparison.", gapToClose: "NEBOSH General Certificate. Your CSCS, SMSTS, and site experience are gold." },
      { title: "Quantity Surveyor", matchPercent: "80-90%", salary: "£30,000 - £65,000", description: "Manage construction costs, procurement, and contracts. High demand role.", whyItFits: "If you have any experience with costing, procurement, or contract management, QS is a natural step.", gapToClose: "RICS qualification for chartered status. Many start with a QS degree or conversion course." },
    ],
    ctaText: "Find out which careers match YOUR construction skills",
  },
  retail: {
    title: "Retail & Hospitality Workers",
    metaTitle: "Career Change from Retail & Hospitality - Where Your Skills Lead",
    metaDescription: "Retail and hospitality experience builds strong people, sales, and operations skills. Discover higher-paying careers that value your customer-facing background.",
    intro: "Retail and hospitality professionals develop world-class people skills that many office workers never acquire. You handle difficult customers, manage teams, hit sales targets, solve problems on the fly, and keep operations running smoothly. These skills command much higher salaries in other industries.",
    transferableSkills: ["Customer Service Excellence", "Sales & Persuasion", "Team Management & Rota Planning", "Stock & Inventory Management", "Cash Handling & Financial Accountability", "Conflict Resolution & De-escalation", "Multi-tasking & Prioritisation", "Visual Merchandising & Presentation", "Health & Safety Compliance", "Training & Onboarding New Staff"],
    careerPaths: [
      { title: "Customer Success Manager", matchPercent: "75-85%", salary: "£30,000 - £60,000", description: "Ensure B2B clients achieve their goals. Build relationships, reduce churn, grow accounts.", whyItFits: "Your customer obsession is the core skill. Tech companies pay significantly more for it.", gapToClose: "Learn about SaaS products and B2B relationships. Your people skills already exceed most candidates." },
      { title: "Recruitment Consultant", matchPercent: "70-80%", salary: "£22,000 - £60,000+", description: "Match candidates to jobs, build client relationships, negotiate deals.", whyItFits: "Sales ability, people reading, and resilience are exactly what recruitment demands.", gapToClose: "None required to start. Many agencies hire from retail/hospitality specifically for these skills." },
      { title: "Business Development Manager", matchPercent: "65-75%", salary: "£28,000 - £80,000+", description: "Win new business, build client relationships, drive revenue.", whyItFits: "You have been selling every day of your career. B2B sales pays significantly better.", gapToClose: "Learn about the specific industry you want to sell in. Sales skills transfer directly." },
      { title: "Event Manager", matchPercent: "70-80%", salary: "£24,000 - £45,000", description: "Plan and deliver events, conferences, and functions.", whyItFits: "Hospitality experience is the perfect foundation. You already manage venues, teams, and logistics.", gapToClose: "Event management qualification helpful. Your operational experience is the main asset." },
      { title: "Estate Agent", matchPercent: "70-80%", salary: "£20,000 - £50,000+", description: "Help people buy, sell, and rent property. Sales, negotiation, and people skills.", whyItFits: "Property sales reward the same skills as retail: people skills, sales ability, and local knowledge.", gapToClose: "ARLA or NAEA qualification. No degree needed. Many start earning commission quickly." },
    ],
    ctaText: "Find out which careers match YOUR retail & hospitality skills",
  },
  military: {
    title: "Military & Armed Forces Veterans",
    metaTitle: "Civilian Careers for Military Veterans - Skills Translation Guide",
    metaDescription: "Military experience develops world-class leadership, planning, and risk management skills. Discover civilian careers that value your service background.",
    intro: "Military service develops leadership, strategic planning, risk management, and teamwork skills at a level few civilian jobs can match. The challenge for veterans is translating military experience into civilian language. We bridge that gap by matching your actual skills to roles, not just your rank or job title.",
    transferableSkills: ["Strategic Planning & Operational Execution", "Team Leadership at Scale", "Risk Assessment & Crisis Management", "Logistics & Supply Chain Coordination", "Training & Development", "Communication Under Pressure", "Compliance & Regulatory Adherence", "Physical Security & Safety Management", "Budget Management & Resource Allocation", "Adaptability & Resilience"],
    careerPaths: [
      { title: "Operations Manager", matchPercent: "85-95%", salary: "£35,000 - £70,000", description: "Oversee business operations, manage teams, optimise processes, deliver results.", whyItFits: "Military operations translate directly. You have managed larger teams under more pressure than most civilians ever will.", gapToClose: "Learn industry-specific terminology. Your leadership and operational skills are your biggest asset." },
      { title: "Project Manager", matchPercent: "80-90%", salary: "£32,000 - £70,000", description: "Deliver projects on time and budget. Manage stakeholders, risks, and resources.", whyItFits: "Military planning is project management at its most demanding. PRINCE2 formalises what you already know.", gapToClose: "PRINCE2 or APM certification. 1-2 weeks of training to add the civilian credential." },
      { title: "Management Consultant", matchPercent: "70-80%", salary: "£35,000 - £100,000", description: "Advise organisations on strategy, operations, and efficiency.", whyItFits: "Strategic thinking, problem solving, and clear communication are exactly what consulting firms need.", gapToClose: "MBA or consulting-specific preparation. Some firms actively recruit military veterans." },
      { title: "Health & Safety Manager", matchPercent: "80-88%", salary: "£30,000 - £60,000", description: "Manage workplace safety, risk assessments, and compliance across organisations.", whyItFits: "Military H&S standards exceed most civilian requirements. Your risk assessment skills are exceptional.", gapToClose: "NEBOSH qualification. Your military safety background gives you a significant head start." },
      { title: "Supply Chain Manager", matchPercent: "75-85%", salary: "£30,000 - £60,000", description: "Manage the flow of goods, logistics, and supplier relationships.", whyItFits: "Military logistics experience is directly applicable. You have managed supply chains in the most challenging conditions.", gapToClose: "CIPS qualification for formal recognition. Your practical experience is highly valued." },
    ],
    ctaText: "Find out which civilian careers match YOUR military skills",
  },
  parents: {
    title: "Parents Returning to Work",
    metaTitle: "Returning to Work After Career Break - Skills-Based Job Matching",
    metaDescription: "Career breaks build real skills: project management, budgeting, crisis resolution. Discover employers who value your experience and offer flexible working.",
    intro: "A career break is not a gap in your skills. It is a different kind of skills development. Managing a household, raising children, coordinating family logistics, and navigating complex systems (schools, healthcare, councils) builds genuine professional competencies. We recognise every one of them.",
    transferableSkills: ["Project Management & Coordination", "Budget Management & Financial Planning", "Crisis Resolution & Problem Solving", "Scheduling & Logistics", "Multitasking Under Pressure", "Negotiation & Advocacy", "Community Organising & Volunteering", "Patience & Emotional Intelligence", "Communication Across Diverse Groups", "Adaptability & Resilience"],
    careerPaths: [
      { title: "Project Manager", matchPercent: "70-80%", salary: "£32,000 - £70,000", description: "Plan and deliver projects. Manage timelines, budgets, stakeholders, and risks.", whyItFits: "Parenting IS project management. Multiple competing priorities, tight deadlines, and limited resources.", gapToClose: "PRINCE2 or APM certification to formalise your skills. Many returner programmes focus on PM roles." },
      { title: "HR Business Partner", matchPercent: "65-75%", salary: "£35,000 - £65,000", description: "Support business leaders with people strategies, employee relations, and talent development.", whyItFits: "Your empathy, conflict resolution, and understanding of diverse needs are core HR skills.", gapToClose: "CIPD qualification. Many can be completed part-time to fit around family commitments." },
      { title: "Event Manager", matchPercent: "70-80%", salary: "£24,000 - £45,000", description: "Plan and deliver events from conferences to community gatherings.", whyItFits: "If you have organised school events, fundraisers, or community activities, you have event management experience.", gapToClose: "Minimal. Volunteer event experience counts. Build a portfolio from what you have already done." },
      { title: "Executive Assistant", matchPercent: "75-85%", salary: "£28,000 - £50,000", description: "Support senior leaders with scheduling, communication, project coordination, and problem solving.", whyItFits: "Managing a household for a senior executive is essentially what you have been doing, but for a family.", gapToClose: "Brush up on office software (Office 365, Google Workspace). Your organisational skills are the main requirement." },
      { title: "Customer Success Manager", matchPercent: "65-75%", salary: "£30,000 - £60,000", description: "Help clients succeed with products or services. Build relationships and solve problems.", whyItFits: "Empathy, communication, and problem solving are your superpowers. Many roles offer flexible or hybrid working.", gapToClose: "Learn about SaaS products and CRM tools. Your soft skills already exceed most candidates." },
    ],
    successStory: { quote: "After 5 years at home with my children, I thought I was unemployable. MatchMySkillset showed me my PTA budgeting, school fundraising, and volunteer coordination experience matched to Project Manager at 78%. I got a PM role within 3 months.", name: "Lisa", transition: "Career Break to Project Manager" },
    ctaText: "Find out which careers match YOUR skills and experience",
  },
  admin: {
    title: "Admin & Office Workers",
    metaTitle: "Career Change from Admin - Higher Paying Roles for Office Skills",
    metaDescription: "Admin experience builds strong organisational, communication, and stakeholder management skills. Discover roles that pay more and challenge you more.",
    intro: "Administrative professionals are the backbone of every organisation. You manage complex schedules, coordinate across departments, handle sensitive information, and keep everything running smoothly. These skills are the foundation of many higher-paying roles.",
    transferableSkills: ["Organisation & Diary Management", "Written & Verbal Communication", "Stakeholder Management", "Attention to Detail", "Microsoft Office / Google Workspace", "Meeting Coordination & Minute Taking", "Data Entry & Database Management", "Problem Solving & Initiative", "Confidentiality & Discretion", "Multi-tasking & Prioritisation"],
    careerPaths: [
      { title: "Executive Assistant", matchPercent: "85-95%", salary: "£28,000 - £50,000", description: "Support C-suite executives with strategic coordination, not just diary management.", whyItFits: "This is the senior version of what you already do, with better pay and more strategic involvement.", gapToClose: "Minimal. Focus your CV on strategic impact, not just tasks completed." },
      { title: "Business Analyst", matchPercent: "65-75%", salary: "£30,000 - £60,000", description: "Bridge the gap between business needs and technology solutions.", whyItFits: "You understand how businesses work from the inside. Process knowledge is a BA's core asset.", gapToClose: "BCS or IIBA certification. Learn requirements gathering and process mapping methodologies." },
      { title: "Project Manager", matchPercent: "70-80%", salary: "£32,000 - £70,000", description: "Deliver projects on time and budget. Coordinate teams and manage stakeholders.", whyItFits: "You already coordinate multiple workstreams and manage stakeholder expectations daily.", gapToClose: "PRINCE2 or APM certification. Your organisational skills are the foundation." },
      { title: "HR Business Partner", matchPercent: "65-75%", salary: "£35,000 - £65,000", description: "Support business leaders with people strategies, recruitment, and employee relations.", whyItFits: "Your people skills, discretion, and organisational ability are core HR competencies.", gapToClose: "CIPD qualification. Many admin professionals transition into HR successfully." },
      { title: "Operations Manager", matchPercent: "60-70%", salary: "£35,000 - £70,000", description: "Manage day-to-day operations, processes, and teams.", whyItFits: "You understand operational detail better than most. The step from admin to ops is natural.", gapToClose: "Build experience in process improvement. Lean Six Sigma basics help." },
    ],
    ctaText: "Find out which careers match YOUR admin skills",
  },
  finance: {
    title: "Finance & Accounting Professionals",
    metaTitle: "Career Change from Finance - Where Analytical Skills Pay More",
    metaDescription: "Financial analysis, attention to detail, and commercial awareness open doors to data, consulting, and tech roles. Explore your options.",
    intro: "Finance professionals are trained in analytical thinking, attention to detail, and commercial decision-making. These are among the most transferable and valuable skills in the modern economy. If you want a change from traditional finance, many industries will pay a premium for your background.",
    transferableSkills: ["Financial Analysis & Modelling", "Advanced Excel & Data Tools", "Attention to Detail & Accuracy", "Regulatory Compliance", "Report Writing & Presentation", "Commercial Awareness", "Risk Assessment", "Auditing & Quality Assurance", "Stakeholder Communication", "Critical Thinking & Problem Solving"],
    careerPaths: [
      { title: "Data Analyst", matchPercent: "80-90%", salary: "£25,000 - £55,000", description: "Analyse data, build dashboards, and provide insights to drive business decisions.", whyItFits: "You already analyse data professionally. SQL and visualisation tools are the main additions.", gapToClose: "Learn SQL, Python basics, and Tableau or Power BI. Google Data Analytics Certificate is a good start." },
      { title: "Management Consultant", matchPercent: "75-85%", salary: "£35,000 - £100,000", description: "Advise organisations on strategy, operations, and financial performance.", whyItFits: "Financial acumen combined with analytical thinking is exactly what consulting firms value.", gapToClose: "MBA or consulting case interview preparation. Big 4 firms actively recruit from finance." },
      { title: "Product Manager", matchPercent: "60-70%", salary: "£40,000 - £85,000", description: "Define product strategy, use data to prioritise features, and work with engineering teams.", whyItFits: "Data-driven decision making and commercial thinking are core PM skills.", gapToClose: "Learn about product development methodologies and tech basics. Your analytical skills transfer directly." },
      { title: "Compliance Officer", matchPercent: "80-90%", salary: "£30,000 - £65,000", description: "Ensure organisations comply with regulations. Conduct audits and assess risks.", whyItFits: "Regulatory knowledge, attention to detail, and risk awareness are your daily tools.", gapToClose: "ICA qualification for specialist compliance. Your finance background is the main requirement." },
      { title: "Business Analyst", matchPercent: "75-85%", salary: "£30,000 - £60,000", description: "Gather requirements, analyse processes, and recommend improvements.", whyItFits: "Financial analysis IS business analysis. You already think in terms of processes and outcomes.", gapToClose: "BCS or IIBA certification. Learn UML and process mapping. Your analytical skills are the foundation." },
    ],
    ctaText: "Find out which careers match YOUR finance skills",
  },
};

export function generateStaticParams() {
  return Object.keys(PROFESSION_DATA).map((profession) => ({ profession }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profession: string }>;
}): Promise<Metadata> {
  const { profession } = await params;
  const data = PROFESSION_DATA[profession];
  if (!data) return { title: "Not Found" };

  return {
    title: data.metaTitle,
    description: data.metaDescription,
  };
}

export default async function ProfessionPage({
  params,
}: {
  params: Promise<{ profession: string }>;
}) {
  const { profession } = await params;
  const data = PROFESSION_DATA[profession];

  if (!data) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/careers-for" className="hover:text-indigo-600">
          Career Change Ideas
        </Link>
        {" / "}
        <span className="text-gray-600">Careers for {data.title}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
        Career Change for {data.title}
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-10">
        {data.intro}
      </p>

      {/* Transferable Skills */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Transferable Skills
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-wrap gap-2">
            {data.transferableSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Top Career Matches for {data.title}
        </h2>
        <div className="space-y-6">
          {data.careerPaths.map((path) => (
            <div
              key={path.title}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {path.title}
                </h3>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-lg font-bold text-green-600">
                    {path.matchPercent}
                  </div>
                  <div className="text-xs text-gray-400">match</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{path.description}</p>
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Salary:</span> {path.salary}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-700 mb-1">
                    Why it fits
                  </div>
                  <p className="text-xs text-green-800">{path.whyItFits}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-amber-700 mb-1">
                    Gap to close
                  </div>
                  <p className="text-xs text-amber-800">{path.gapToClose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Story */}
      {data.successStory && (
        <section className="mb-12 bg-indigo-50 rounded-xl p-6">
          <div className="text-indigo-600 text-sm font-semibold mb-2">
            Success Story
          </div>
          <blockquote className="text-gray-700 italic mb-3">
            &ldquo;{data.successStory.quote}&rdquo;
          </blockquote>
          <div className="text-sm text-gray-500">
            {data.successStory.name} - {data.successStory.transition}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {data.ctaText}
        </h2>
        <p className="text-gray-500 mb-6">
          Our AI analyses your specific experience and finds careers personalised
          to you. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Discover My Career Matches
          </Link>
          <Link
            href={`/jobs?q=${encodeURIComponent(data.careerPaths[0].title)}`}
            className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors"
          >
            Browse {data.careerPaths[0].title} Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}
