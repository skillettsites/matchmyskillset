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
  "communication-skills": {
    title: "Communication Skills",
    metaTitle: "What Jobs Need Communication Skills? | Top Career Matches 2026",
    metaDescription: "Communication is one of the most in-demand skills across every industry. Discover 10+ careers where strong verbal and written communication leads to higher pay.",
    intro: "Communication skills sit at the heart of almost every high-paying career. If you can explain complex ideas clearly, tailor your message to different audiences, and build trust through conversation, you have something most employers cannot train into people. Whether your communication strength comes from presenting, writing, negotiating, or simply being the person everyone turns to for clarity, these careers put that ability to work.",
    keySkills: ["Public Speaking & Presentation", "Written Communication", "Active Listening", "Negotiation", "Persuasion & Influence", "Storytelling", "Cross-Cultural Communication", "Conflict Resolution", "Report Writing", "Stakeholder Engagement"],
    topJobs: [
      { title: "Communications Manager", salary: "£35k-£65k", match: "85-95%", why: "This is the pure play. Internal comms, press releases, strategy documents. Your core skill is the entire job description." },
      { title: "Public Relations Manager", salary: "£30k-£60k", match: "80-90%", why: "Crafting narratives, managing media relationships, and writing under pressure. Strong communicators thrive here." },
      { title: "Content Strategist", salary: "£28k-£55k", match: "75-85%", why: "Planning and creating content that resonates with specific audiences. Your ability to adapt tone and message is the key skill." },
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "70-80%", why: "Building long-term client relationships through clear, empathetic communication. Retention depends on your skill." },
      { title: "Sales Manager", salary: "£35k-£80k+", match: "70-80%", why: "Persuasion, pitch delivery, and objection handling are communication skills applied to revenue generation." },
      { title: "Training & Development Manager", salary: "£35k-£60k", match: "75-85%", why: "Delivering workshops, creating learning materials, and coaching individuals. Communication is the core deliverable." },
      { title: "HR Business Partner", salary: "£35k-£65k", match: "65-75%", why: "Employee relations, policy communication, and sensitive conversations. HR runs on communication." },
      { title: "Management Consultant", salary: "£35k-£100k", match: "70-80%", why: "Presenting findings to boards, writing proposals, and influencing senior stakeholders. Communication separates good consultants from great ones." },
    ],
    surprisingJobs: [
      { title: "UX Writer", why: "Microcopy, button labels, error messages. Tech companies pay well for people who can communicate clearly in very few words." },
      { title: "Mediator", why: "Professional dispute resolution. Your ability to listen, reframe, and guide conversations toward agreement is the entire role." },
      { title: "Bid Writer", why: "Writing persuasive proposals worth millions. Strong communicators with attention to detail earn excellent salaries in procurement." },
    ],
    jsonLdSkills: ["Communication", "Public Speaking", "Written Communication", "Negotiation", "Stakeholder Management"],
  },
  "leadership-skills": {
    title: "Leadership Skills",
    metaTitle: "Careers for People With Leadership Skills | Top Matches 2026",
    metaDescription: "Leadership skills open doors to management, consulting, programme delivery, and executive roles. Discover 10+ careers that reward your ability to lead.",
    intro: "Leadership is not just about managing people. It is about vision, decision-making, accountability, and the ability to get the best out of others. Whether you have led teams of 5 or 500, in an office or on a factory floor, your leadership experience is one of the most valuable assets on your CV. These careers reward it with higher salaries and greater impact.",
    keySkills: ["Team Management", "Strategic Thinking", "Decision Making", "Delegation", "Performance Management", "Change Management", "Coaching & Mentoring", "Budget Responsibility", "Conflict Resolution", "Stakeholder Influence"],
    topJobs: [
      { title: "Operations Director", salary: "£60k-£120k", match: "85-95%", why: "Operational leadership at scale. Your ability to coordinate teams, manage budgets, and drive performance is exactly what this role demands." },
      { title: "Programme Manager", salary: "£50k-£90k", match: "80-90%", why: "Leading multiple projects and their interdependencies. Strategic oversight combined with team leadership." },
      { title: "Management Consultant", salary: "£35k-£100k", match: "75-85%", why: "Leading client engagements, managing junior consultants, and influencing C-suite decisions." },
      { title: "Head of People / HR Director", salary: "£55k-£100k", match: "70-80%", why: "People strategy, culture building, and organisational design. Leadership experience from any sector transfers directly." },
      { title: "General Manager", salary: "£40k-£80k", match: "80-90%", why: "Full P&L responsibility, team leadership, and strategic planning. The generalist leader role." },
      { title: "Scrum Master / Agile Coach", salary: "£40k-£75k", match: "65-75%", why: "Servant leadership in tech. Removing blockers, coaching teams, and facilitating continuous improvement." },
      { title: "Charity CEO / Director", salary: "£40k-£80k", match: "70-80%", why: "Leading with purpose. Your leadership skills drive social impact rather than shareholder returns." },
      { title: "Franchise Owner", salary: "£30k-£100k+", match: "75-85%", why: "Entrepreneurial leadership with a proven business model. Your people management and commercial skills are the foundation." },
    ],
    surprisingJobs: [
      { title: "School Governor", why: "Part-time governance role that uses your strategic leadership to shape education. Many leaders find this deeply rewarding." },
      { title: "Sustainability Director", why: "ESG leadership is a fast-growing field. Leading cross-functional change programmes is exactly what you do." },
      { title: "Crisis Manager", why: "Leading through chaos. Your ability to stay calm, make decisions, and coordinate teams under pressure is rare and highly paid." },
    ],
    jsonLdSkills: ["Leadership", "Team Management", "Strategic Planning", "Change Management", "Decision Making"],
  },
  "problem-solving-skills": {
    title: "Problem Solving Skills",
    metaTitle: "Jobs That Need Problem Solving Skills | Best Career Matches 2026",
    metaDescription: "Problem solving is the most universally valued skill. Discover careers in consulting, engineering, data science, and more that reward analytical thinking.",
    intro: "Every employer says they want problem solvers, but few people can articulate what that actually means. If you are the person who breaks down complex situations, identifies root causes, tests solutions, and finds the path forward when others are stuck, you have a skill that commands premium salaries across every sector. Here is where problem solvers thrive.",
    keySkills: ["Root Cause Analysis", "Critical Thinking", "Data Interpretation", "Process Improvement", "Creative Thinking", "Risk Assessment", "Hypothesis Testing", "Systems Thinking", "Logical Reasoning", "Decision Making Under Uncertainty"],
    topJobs: [
      { title: "Management Consultant", salary: "£35k-£100k", match: "85-95%", why: "Consulting is professional problem solving. Clients pay premium rates for people who can diagnose issues and recommend solutions." },
      { title: "Business Analyst", salary: "£30k-£60k", match: "80-90%", why: "Analysing processes, identifying inefficiencies, and designing better systems. Problem solving is the entire job." },
      { title: "Data Analyst", salary: "£28k-£55k", match: "75-85%", why: "Using data to answer questions and solve business problems. Analytical thinking is the core requirement." },
      { title: "Solutions Architect", salary: "£55k-£100k", match: "75-85%", why: "Designing technical solutions to complex business problems. High-level problem solving with significant pay." },
      { title: "Product Manager", salary: "£40k-£85k", match: "70-80%", why: "Identifying user problems, prioritising solutions, and measuring impact. Product is applied problem solving." },
      { title: "Process Improvement Manager", salary: "£40k-£70k", match: "80-90%", why: "Lean, Six Sigma, and continuous improvement. Your systematic approach to problem solving is the core skill." },
      { title: "DevOps Engineer", salary: "£40k-£80k", match: "65-75%", why: "Debugging, automation, and infrastructure design. Technical problem solving at its purest." },
      { title: "Forensic Accountant", salary: "£35k-£75k", match: "70-80%", why: "Investigating financial irregularities and fraud. Detective-level problem solving applied to numbers." },
    ],
    surprisingJobs: [
      { title: "Escape Room Designer", why: "Creating puzzles for a living. Your understanding of how people approach problems is the creative foundation." },
      { title: "Supply Chain Analyst", why: "Global logistics is one enormous optimisation problem. Your systematic thinking finds efficiencies worth millions." },
      { title: "Insurance Loss Adjuster", why: "Investigating claims, assessing evidence, and determining what happened. Applied problem solving with excellent pay." },
    ],
    jsonLdSkills: ["Problem Solving", "Critical Thinking", "Data Analysis", "Process Improvement", "Root Cause Analysis"],
  },
  "excel-skills": {
    title: "Excel Skills",
    metaTitle: "Jobs That Use Excel | Career Matches for Spreadsheet Experts 2026",
    metaDescription: "Advanced Excel skills are in huge demand. Discover careers in data analysis, finance, operations, and business intelligence that pay £30k-£70k+.",
    intro: "If you are the person people come to when their spreadsheet breaks, you have a more valuable skill than you realise. Advanced Excel skills, including formulas, pivot tables, VLOOKUP, macros, and data modelling, are the gateway to careers in data, finance, and business intelligence. Many of these roles will also give you the opportunity to learn SQL and Python, building on the analytical foundation Excel has already given you.",
    keySkills: ["Advanced Formulas (INDEX/MATCH, XLOOKUP)", "Pivot Tables & Charts", "Data Cleaning & Transformation", "VBA Macros & Automation", "Financial Modelling", "Dashboard Creation", "Data Validation", "Power Query", "Conditional Formatting & Reporting", "What-If Analysis"],
    topJobs: [
      { title: "Data Analyst", salary: "£28k-£55k", match: "85-95%", why: "Excel is where most data analysts start. Your skills in data manipulation, pivot tables, and charting are directly applicable from day one." },
      { title: "Financial Analyst", salary: "£30k-£65k", match: "80-90%", why: "Financial modelling lives in Excel. Your ability to build complex spreadsheets is the core technical requirement." },
      { title: "Business Intelligence Analyst", salary: "£32k-£60k", match: "75-85%", why: "BI is Excel thinking applied to bigger datasets. Your analytical mindset transfers; the tools are learnable." },
      { title: "Management Accountant", salary: "£30k-£55k", match: "75-85%", why: "Budgeting, forecasting, and variance analysis. Excel is the daily workhorse of management accounting." },
      { title: "Operations Analyst", salary: "£28k-£50k", match: "70-80%", why: "Process data, efficiency metrics, and capacity planning. Your spreadsheet skills drive operational decisions." },
      { title: "Revenue Operations Analyst", salary: "£30k-£55k", match: "70-80%", why: "Sales data, pipeline analysis, and commission calculations. A growing field where Excel skills are essential." },
      { title: "Pricing Analyst", salary: "£28k-£50k", match: "75-85%", why: "Competitive analysis, margin calculations, and pricing models. Complex Excel work with direct business impact." },
    ],
    surprisingJobs: [
      { title: "Property Developer", why: "Feasibility models, cash flow projections, and investment appraisals. Property finance runs on Excel." },
      { title: "Logistics Coordinator", why: "Route optimisation, inventory tracking, and capacity planning. Your spreadsheet skills solve real operational problems." },
      { title: "Campaign Manager (Marketing)", why: "ROI tracking, A/B test analysis, and budget allocation. Marketing teams need people who can turn data into decisions." },
    ],
    jsonLdSkills: ["Microsoft Excel", "Data Analysis", "Financial Modelling", "Spreadsheet Automation", "Business Intelligence"],
  },
  "empathy-skills": {
    title: "Empathy Skills",
    metaTitle: "Jobs for Empathetic People | Careers Using Empathy 2026",
    metaDescription: "Empathy is a professional superpower. Discover careers in counselling, UX, HR, customer success, and more that reward emotional intelligence with strong salaries.",
    intro: "Empathy is often dismissed as a soft skill, but it is one of the most commercially valuable abilities in the modern workplace. If you naturally understand what other people are feeling, anticipate their needs, and create environments where people feel heard, you have a skill that drives customer retention, employee engagement, product design, and therapeutic outcomes. These careers put empathy at the centre.",
    keySkills: ["Active Listening", "Emotional Intelligence", "Conflict Resolution", "Non-Verbal Communication", "Perspective Taking", "Building Psychological Safety", "Compassionate Feedback", "Cultural Sensitivity", "De-escalation", "Trust Building"],
    topJobs: [
      { title: "Counsellor / Therapist", salary: "£25k-£50k", match: "85-95%", why: "The most direct application of empathy as a professional skill. Helping people through difficult times using your natural ability to connect." },
      { title: "UX Researcher", salary: "£30k-£60k", match: "75-85%", why: "Understanding user frustrations, motivations, and unspoken needs. Empathetic people produce better research insights." },
      { title: "Customer Success Manager", salary: "£30k-£60k", match: "75-85%", why: "Client retention depends on understanding what clients actually need, not just what they say. Empathy drives commercial outcomes." },
      { title: "HR Business Partner", salary: "£35k-£65k", match: "70-80%", why: "Employee relations, wellbeing programmes, and sensitive conversations. HR roles reward emotional intelligence." },
      { title: "Social Worker", salary: "£27k-£45k", match: "80-90%", why: "Supporting vulnerable people through complex life situations. Empathy combined with professional boundaries." },
      { title: "Palliative Care Coordinator", salary: "£28k-£45k", match: "80-90%", why: "Guiding families through the most difficult time of their lives. Deep empathy is the non-negotiable requirement." },
      { title: "Mediator", salary: "£30k-£60k", match: "70-80%", why: "Understanding both sides of a dispute and guiding resolution. Empathy allows you to see what others miss." },
      { title: "Patient Experience Manager", salary: "£32k-£55k", match: "75-85%", why: "Improving how patients feel about their healthcare journey. Empathy informs every recommendation you make." },
    ],
    surprisingJobs: [
      { title: "Product Designer", why: "The best designers feel user pain viscerally. Empathy-driven design creates products people love, and companies pay premium salaries for it." },
      { title: "Hostage Negotiator", why: "Extreme empathy under pressure. Understanding someone's emotional state and building rapport when lives are at stake." },
      { title: "Luxury Retail Manager", why: "High-end retail is about reading people, anticipating desires, and creating personalised experiences. Empathy drives sales." },
    ],
    jsonLdSkills: ["Empathy", "Emotional Intelligence", "Active Listening", "Conflict Resolution", "Counselling"],
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

  // "How to Become" pages
  "how-to-become-data-analyst": { title: "How to Become a Data Analyst", metaTitle: "How to Become a Data Analyst UK 2026 | Skills & Routes", metaDescription: "Learn how to become a data analyst in the UK. Key skills include Excel, SQL, and Python. Salaries range from £25k-£55k with multiple entry routes including bootcamps and self-study." },
  "how-to-become-ux-designer": { title: "How to Become a UX Designer", metaTitle: "How to Become a UX Designer UK 2026 | Skills & Routes", metaDescription: "Learn how to become a UX designer in the UK. Key skills include user research, wireframing, and prototyping. Salaries range from £28k-£65k with routes through bootcamps, degrees, and portfolio work." },
  "how-to-become-product-manager": { title: "How to Become a Product Manager", metaTitle: "How to Become a Product Manager UK 2026 | Skills & Routes", metaDescription: "Learn how to become a product manager in the UK. Key skills include strategy, stakeholder management, and data analysis. Salaries range from £35k-£85k with routes from most industries." },
  "how-to-become-project-manager": { title: "How to Become a Project Manager", metaTitle: "How to Become a Project Manager UK 2026 | Skills & Routes", metaDescription: "Learn how to become a project manager in the UK. Key skills include planning, budgeting, and risk management. Salaries range from £30k-£70k with PRINCE2 and PMP certifications as entry routes." },
  "how-to-become-software-developer": { title: "How to Become a Software Developer", metaTitle: "How to Become a Software Developer UK 2026 | Skills & Routes", metaDescription: "Learn how to become a software developer in the UK. Key skills include JavaScript, Python, and Git. Salaries range from £28k-£75k with routes through bootcamps, degrees, and self-taught portfolios." },
  "how-to-become-digital-marketer": { title: "How to Become a Digital Marketer", metaTitle: "How to Become a Digital Marketer UK 2026 | Skills & Routes", metaDescription: "Learn how to become a digital marketer in the UK. Key skills include SEO, PPC, and analytics. Salaries range from £22k-£55k with entry routes through certifications and apprenticeships." },
  "how-to-become-hr-manager": { title: "How to Become an HR Manager", metaTitle: "How to Become a HR Manager UK 2026 | Skills & Routes", metaDescription: "Learn how to become an HR manager in the UK. Key skills include employee relations, employment law, and CIPD qualifications. Salaries range from £35k-£65k with clear progression paths." },
  "how-to-become-business-analyst": { title: "How to Become a Business Analyst", metaTitle: "How to Become a Business Analyst UK 2026 | Skills & Routes", metaDescription: "Learn how to become a business analyst in the UK. Key skills include requirements gathering, process mapping, and SQL. Salaries range from £28k-£60k with BCS certification routes." },
  "how-to-become-scrum-master": { title: "How to Become a Scrum Master", metaTitle: "How to Become a Scrum Master UK 2026 | Skills & Routes", metaDescription: "Learn how to become a scrum master in the UK. Key skills include Agile facilitation, coaching, and impediment removal. Salaries range from £40k-£75k with PSM and CSM certification routes." },
  "how-to-become-cybersecurity-analyst": { title: "How to Become a Cybersecurity Analyst", metaTitle: "How to Become a Cybersecurity Analyst UK 2026 | Skills & Routes", metaDescription: "Learn how to become a cybersecurity analyst in the UK. Key skills include network security, threat analysis, and SIEM tools. Salaries range from £30k-£65k with CompTIA and CISSP routes." },
  "how-to-become-content-writer": { title: "How to Become a Content Writer", metaTitle: "How to Become a Content Writer UK 2026 | Skills & Routes", metaDescription: "Learn how to become a content writer in the UK. Key skills include SEO writing, research, and audience analysis. Salaries range from £22k-£45k with freelance and in-house entry routes." },
  "how-to-become-operations-manager": { title: "How to Become an Operations Manager", metaTitle: "How to Become a Operations Manager UK 2026 | Skills & Routes", metaDescription: "Learn how to become an operations manager in the UK. Key skills include process optimisation, team leadership, and budget management. Salaries range from £32k-£70k with routes from most sectors." },
  "how-to-become-financial-analyst": { title: "How to Become a Financial Analyst", metaTitle: "How to Become a Financial Analyst UK 2026 | Skills & Routes", metaDescription: "Learn how to become a financial analyst in the UK. Key skills include financial modelling, Excel, and forecasting. Salaries range from £28k-£65k with CFA and CIMA certification routes." },
  "how-to-become-graphic-designer": { title: "How to Become a Graphic Designer", metaTitle: "How to Become a Graphic Designer UK 2026 | Skills & Routes", metaDescription: "Learn how to become a graphic designer in the UK. Key skills include Adobe Creative Suite, typography, and branding. Salaries range from £22k-£50k with degree and portfolio-based entry routes." },
  "how-to-become-recruitment-consultant": { title: "How to Become a Recruitment Consultant", metaTitle: "How to Become a Recruitment Consultant UK 2026 | Skills & Routes", metaDescription: "Learn how to become a recruitment consultant in the UK. Key skills include sales, relationship building, and candidate assessment. Salaries range from £22k-£60k+ with OTE, no degree required." },

  // "Jobs That Pay" pages
  "jobs-that-pay-30k": { title: "Jobs That Pay £30k", metaTitle: "Jobs That Pay £30k+ UK 2026 | Realistic Career Options", metaDescription: "Discover realistic UK jobs paying £30,000 or more. Includes entry-level professional roles, skilled trades, and career-change options with no degree required." },
  "jobs-that-pay-40k": { title: "Jobs That Pay £40k", metaTitle: "Jobs That Pay £40k+ UK 2026 | Mid-Career Salary Guide", metaDescription: "Discover UK jobs paying £40,000 or more. Includes mid-career roles in tech, finance, project management, and operations with clear routes to reach this level." },
  "jobs-that-pay-50k": { title: "Jobs That Pay £50k", metaTitle: "Jobs That Pay £50k+ UK 2026 | High-Salary Career Guide", metaDescription: "Discover UK jobs paying £50,000 or more. Includes senior roles in management, consulting, data science, and engineering with realistic paths to get there." },
  "jobs-that-pay-60k": { title: "Jobs That Pay £60k", metaTitle: "Jobs That Pay £60k+ UK 2026 | Senior Career Paths", metaDescription: "Discover UK jobs paying £60,000 or more. Includes senior management, technical leadership, and specialist roles with the experience and skills needed to qualify." },
  "jobs-that-pay-70k": { title: "Jobs That Pay £70k", metaTitle: "Jobs That Pay £70k+ UK 2026 | High-Earning Career Guide", metaDescription: "Discover UK jobs paying £70,000 or more. Includes director-level roles, senior tech positions, and specialist consulting with the career steps to reach this salary." },
  "jobs-that-pay-100k": { title: "Jobs That Pay £100k", metaTitle: "Jobs That Pay £100k+ UK 2026 | Top-Earning Careers", metaDescription: "Discover UK jobs paying £100,000 or more. Includes C-suite, senior tech, finance, and consulting roles with realistic strategies for reaching six figures." },

  // "Jobs For" personality/situation pages
  "jobs-for-extroverts": { title: "Jobs for Extroverts", metaTitle: "Best Jobs for Extroverts UK 2026 | Careers That Match Your Energy", metaDescription: "Discover the best UK careers for extroverts. High-energy roles in sales, events, recruitment, and management where your people skills drive success and higher pay." },
  "jobs-for-creative-people": { title: "Jobs for Creative People", metaTitle: "Best Jobs for Creative People UK 2026 | Career Matches", metaDescription: "Discover UK careers for creative thinkers. Roles in design, content, marketing, and product development where creativity is valued and rewarded." },
  "jobs-for-analytical-thinkers": { title: "Jobs for Analytical Thinkers", metaTitle: "Best Jobs for Analytical Thinkers UK 2026 | Career Guide", metaDescription: "Discover UK careers for analytical minds. Roles in data, consulting, finance, and engineering where your logical thinking and problem-solving earn premium salaries." },
  "jobs-for-people-who-like-helping": { title: "Jobs for People Who Like Helping Others", metaTitle: "Best Jobs for People Who Like Helping Others UK 2026", metaDescription: "Discover UK careers for people who want to help others. Roles in healthcare, counselling, social work, and education where making a difference is the daily reward." },
  "jobs-for-over-50s": { title: "Jobs for Over 50s", metaTitle: "Best Jobs for Over 50s UK 2026 | Career Change Guide", metaDescription: "Discover the best UK careers for people over 50. Roles that value your experience, offer flexibility, and provide meaningful work for the next chapter of your career." },
  "jobs-for-career-changers": { title: "Jobs for Career Changers", metaTitle: "Best Jobs for Career Changers UK 2026 | Transferable Skills Guide", metaDescription: "Discover the best UK careers for career changers. Roles where transferable skills matter more than specific experience, with realistic entry routes and salary expectations." },
  "jobs-for-graduates": { title: "Jobs for Graduates", metaTitle: "Best Jobs for Graduates UK 2026 | Beyond Graduate Schemes", metaDescription: "Discover UK careers for graduates beyond the big graduate schemes. Roles in startups, SMEs, and growing companies where your degree and ambition open doors fast." },
  "jobs-for-parents": { title: "Jobs for Parents", metaTitle: "Best Jobs for Parents UK 2026 | Flexible Career Options", metaDescription: "Discover UK careers offering genuine flexibility for parents. Remote, part-time, and term-time roles that pay well without sacrificing family time." },
  "jobs-for-ex-military": { title: "Jobs for Ex-Military", metaTitle: "Best Jobs for Ex-Military UK 2026 | Civilian Career Guide", metaDescription: "Discover the best UK civilian careers for ex-military personnel. Roles that value your leadership, discipline, and operational planning with clear transition routes." },
  "jobs-for-people-with-anxiety": { title: "Jobs for People With Anxiety", metaTitle: "Best Jobs for People With Anxiety UK 2026 | Low-Stress Careers", metaDescription: "Discover UK careers suited to people with anxiety. Roles with predictable routines, low confrontation, and supportive environments that still offer good pay and progression." },
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
