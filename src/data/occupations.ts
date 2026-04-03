// UK-relevant occupations derived from O*NET SOC codes and UK SOC 2020
// Each occupation has required skills with importance scores (1-5)
// and salary data from ONS ASHE 2025

export interface OccupationSkill {
  skillId: string;
  importance: number; // 1-5 (5 = essential)
}

export interface Occupation {
  id: string; // UK SOC-style code
  title: string;
  alternativeTitles: string[];
  description: string;
  sector: string;
  requiredSkills: OccupationSkill[];
  salary: { min: number; max: number; median: number };
  demand: "high" | "medium" | "low";
  growthOutlook: "growing" | "stable" | "declining";
  remoteOptions: "fully-remote" | "hybrid" | "office" | "on-site";
  entryRoutes: string[]; // how people typically get into this role
}

export const OCCUPATIONS: Occupation[] = [
  // === TECHNOLOGY ===
  {
    id: "uk-2136",
    title: "Software Developer",
    alternativeTitles: ["Software Engineer", "Full-Stack Developer", "Backend Developer", "Frontend Developer", "Web Developer"],
    description: "Design, build, and maintain software applications and systems. Write code, fix bugs, and collaborate with product teams to deliver features.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s107", importance: 5 }, // Software Development
      { skillId: "s024", importance: 5 }, // Problem Solving
      { skillId: "s105", importance: 4 }, // JavaScript
      { skillId: "s103", importance: 4 }, // SQL
      { skillId: "s051", importance: 3 }, // Teamwork
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s108", importance: 3 }, // Cloud Computing
    ],
    salary: { min: 30000, max: 80000, median: 50000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Computer Science degree", "Coding bootcamp", "Self-taught with portfolio", "Apprenticeship"],
  },
  {
    id: "uk-2135",
    title: "Data Analyst",
    alternativeTitles: ["Business Intelligence Analyst", "Analytics Specialist", "Reporting Analyst", "Insights Analyst"],
    description: "Collect, process, and analyse data to help organisations make informed decisions. Create reports, dashboards, and visualisations.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s020", importance: 5 }, // Data Analysis
      { skillId: "s101", importance: 5 }, // Advanced Excel
      { skillId: "s103", importance: 4 }, // SQL
      { skillId: "s102", importance: 4 }, // Data Visualisation
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 25000, max: 55000, median: 35000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Any analytical degree", "Google Data Analytics Certificate", "Self-taught with portfolio", "Career change from finance/research"],
  },
  {
    id: "uk-2137",
    title: "UX Designer",
    alternativeTitles: ["UX/UI Designer", "Product Designer", "Interaction Designer", "User Experience Designer"],
    description: "Research user needs, design interfaces, create wireframes and prototypes, and test designs to ensure products are usable and enjoyable.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s113", importance: 5 }, // UX Design
      { skillId: "s022", importance: 5 }, // Research
      { skillId: "s050", importance: 4 }, // Empathy
      { skillId: "s155", importance: 4 }, // Innovation
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s051", importance: 3 }, // Teamwork
      { skillId: "s151", importance: 3 }, // Graphic Design
      { skillId: "s024", importance: 3 }, // Problem Solving
    ],
    salary: { min: 30000, max: 65000, median: 42000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Design degree", "UX bootcamp (General Assembly, CareerFoundry)", "Career change from teaching/psychology/research", "Self-taught portfolio"],
  },
  {
    id: "uk-2139",
    title: "Data Scientist",
    alternativeTitles: ["Machine Learning Engineer", "AI Engineer", "Applied Scientist"],
    description: "Build predictive models and algorithms using statistical methods and machine learning to extract insights from complex datasets.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s114", importance: 5 }, // Data Science
      { skillId: "s104", importance: 5 }, // Python
      { skillId: "s023", importance: 5 }, // Statistical Analysis
      { skillId: "s103", importance: 4 }, // SQL
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s002", importance: 3 }, // Verbal Communication
    ],
    salary: { min: 35000, max: 90000, median: 55000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["STEM degree + Masters", "Data science bootcamp", "Career change from academia/research", "Self-taught with Kaggle portfolio"],
  },
  {
    id: "uk-2134",
    title: "Cybersecurity Analyst",
    alternativeTitles: ["Information Security Analyst", "Security Engineer", "SOC Analyst"],
    description: "Protect organisations from cyber threats by monitoring systems, investigating incidents, and implementing security controls.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s109", importance: 5 }, // Cybersecurity
      { skillId: "s024", importance: 5 }, // Problem Solving
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s108", importance: 3 }, // Cloud Computing
      { skillId: "s047", importance: 3 }, // Risk Management
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s116", importance: 3 }, // IT Support
    ],
    salary: { min: 30000, max: 75000, median: 47000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["IT degree", "CompTIA Security+", "Career change from IT support", "Cyber apprenticeship"],
  },

  // === BUSINESS & MANAGEMENT ===
  {
    id: "uk-2423",
    title: "Product Manager",
    alternativeTitles: ["Product Owner", "Digital Product Manager", "Technical Product Manager"],
    description: "Define product strategy, prioritise features, work with engineering and design teams to deliver products that meet user and business needs.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s042", importance: 5 }, // Strategic Planning
      { skillId: "s048", importance: 5 }, // Stakeholder Management
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s025", importance: 4 }, // Decision Making
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s051", importance: 3 }, // Teamwork
    ],
    salary: { min: 40000, max: 85000, median: 60000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree + product experience", "Career change from project management/consulting", "MBA", "Internal move from engineering/design"],
  },
  {
    id: "uk-3541",
    title: "Operations Manager",
    alternativeTitles: ["Operations Director", "Business Operations Manager", "Head of Operations"],
    description: "Oversee daily business operations, manage teams, optimise processes, and ensure efficient delivery of services or products.",
    sector: "Business",
    requiredSkills: [
      { skillId: "s049", importance: 5 }, // Operations Management
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s026", importance: 4 }, // Process Improvement
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s025", importance: 4 }, // Decision Making
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s047", importance: 3 }, // Risk Management
    ],
    salary: { min: 35000, max: 70000, median: 45000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Management degree", "Career progression from team lead", "Career change from military/construction/retail management", "Operations apprenticeship"],
  },
  {
    id: "uk-2424",
    title: "Management Consultant",
    alternativeTitles: ["Strategy Consultant", "Business Consultant", "Advisory Consultant"],
    description: "Advise organisations on strategy, operations, and technology to solve complex business problems and drive performance improvement.",
    sector: "Professional Services",
    requiredSkills: [
      { skillId: "s021", importance: 5 }, // Critical Thinking
      { skillId: "s024", importance: 5 }, // Problem Solving
      { skillId: "s002", importance: 5 }, // Verbal Communication
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s042", importance: 4 }, // Strategic Planning
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s005", importance: 3 }, // Persuasion
      { skillId: "s048", importance: 3 }, // Stakeholder Management
    ],
    salary: { min: 35000, max: 100000, median: 55000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Top university degree", "MBA", "Career change from industry specialist role", "Big 4 graduate scheme"],
  },
  {
    id: "uk-3545",
    title: "Customer Success Manager",
    alternativeTitles: ["Client Success Manager", "Customer Experience Manager", "Account Manager"],
    description: "Ensure customers achieve their goals using the product or service. Build relationships, reduce churn, and identify upsell opportunities.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s006", importance: 5 }, // Client Relationship Management
      { skillId: "s050", importance: 5 }, // Empathy
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s024", importance: 4 }, // Problem Solving
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s057", importance: 3 }, // Customer Service
      { skillId: "s004", importance: 3 }, // Negotiation
      { skillId: "s040", importance: 3 }, // Project Management
    ],
    salary: { min: 30000, max: 60000, median: 40000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from teaching/customer service/sales", "Internal move from support", "Account management experience"],
  },

  // === MARKETING & CREATIVE ===
  {
    id: "uk-2473",
    title: "Digital Marketing Manager",
    alternativeTitles: ["Marketing Manager", "Growth Marketing Manager", "Performance Marketing Manager"],
    description: "Plan and execute digital marketing campaigns across channels including SEO, PPC, social media, email, and content marketing.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s111", importance: 5 }, // Digital Marketing
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s150", importance: 4 }, // Content Creation
      { skillId: "s042", importance: 3 }, // Strategic Planning
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s112", importance: 3 }, // Social Media Management
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s155", importance: 3 }, // Innovation
    ],
    salary: { min: 28000, max: 65000, median: 40000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Marketing degree", "Digital marketing bootcamp", "Career change from journalism/PR/teaching", "Google/Meta certifications"],
  },
  {
    id: "uk-2471",
    title: "Content Strategist",
    alternativeTitles: ["Content Manager", "Content Lead", "Editorial Manager"],
    description: "Plan, create, and manage content across platforms to engage audiences and support business goals. Develop content calendars and editorial guidelines.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s150", importance: 5 }, // Content Creation
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s042", importance: 4 }, // Strategic Planning
      { skillId: "s111", importance: 3 }, // Digital Marketing
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s009", importance: 3 }, // Storytelling
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s112", importance: 3 }, // Social Media Management
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["English/Journalism degree", "Career change from teaching/PR/copywriting", "Freelance content writing experience", "Blog or portfolio"],
  },

  // === HR & PEOPLE ===
  {
    id: "uk-3562",
    title: "HR Business Partner",
    alternativeTitles: ["HR Manager", "People Partner", "People Manager"],
    description: "Partner with business leaders to develop and implement HR strategies. Handle employee relations, recruitment, performance, and organisational development.",
    sector: "Human Resources",
    requiredSkills: [
      { skillId: "s048", importance: 5 }, // Stakeholder Management
      { skillId: "s050", importance: 4 }, // Empathy
      { skillId: "s007", importance: 4 }, // Conflict Resolution
      { skillId: "s046", importance: 4 }, // Recruitment
      { skillId: "s044", importance: 4 }, // Performance Management
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s045", importance: 3 }, // Change Management
    ],
    salary: { min: 35000, max: 65000, median: 48000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["CIPD qualification", "HR degree", "Career change from management/teaching", "HR apprenticeship"],
  },
  {
    id: "uk-3563",
    title: "Learning and Development Manager",
    alternativeTitles: ["L&D Manager", "Training Manager", "People Development Manager", "Talent Development Manager"],
    description: "Design and deliver training programmes to develop employee skills. Assess training needs, create learning content, and measure impact.",
    sector: "Human Resources",
    requiredSkills: [
      { skillId: "s161", importance: 5 }, // Training Delivery
      { skillId: "s157", importance: 5 }, // Curriculum Design
      { skillId: "s055", importance: 4 }, // Mentoring
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s155", importance: 3 }, // Innovation
    ],
    salary: { min: 35000, max: 60000, median: 45000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Teaching background", "CIPD L&D qualification", "Career change from education", "Training delivery experience"],
  },

  // === FINANCE ===
  {
    id: "uk-2421",
    title: "Financial Analyst",
    alternativeTitles: ["Business Financial Analyst", "FP&A Analyst", "Commercial Analyst"],
    description: "Analyse financial data, build models, forecast performance, and provide insights to support business decision-making.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s027", importance: 5 }, // Financial Analysis
      { skillId: "s101", importance: 5 }, // Advanced Excel
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s102", importance: 3 }, // Data Visualisation
    ],
    salary: { min: 28000, max: 65000, median: 42000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Finance/Economics/Maths degree", "CIMA/ACCA qualification", "Career change from accounting/banking", "ACA training"],
  },

  // === PROJECT MANAGEMENT ===
  {
    id: "uk-2422",
    title: "Project Manager",
    alternativeTitles: ["Programme Manager", "Delivery Manager", "IT Project Manager"],
    description: "Plan, execute, and close projects on time and within budget. Manage teams, risks, and stakeholders to deliver outcomes.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s040", importance: 5 }, // Project Management
      { skillId: "s048", importance: 5 }, // Stakeholder Management
      { skillId: "s041", importance: 4 }, // Team Leadership
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s047", importance: 4 }, // Risk Management
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s025", importance: 3 }, // Decision Making
      { skillId: "s053", importance: 3 }, // Time Management
    ],
    salary: { min: 32000, max: 70000, median: 48000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["PRINCE2/PMP certification", "Career change from any management role", "APM qualification", "Progression from coordinator role"],
  },

  // === SALES ===
  {
    id: "uk-3542",
    title: "Business Development Manager",
    alternativeTitles: ["Sales Manager", "BDM", "New Business Manager", "Account Executive"],
    description: "Identify and develop new business opportunities, build client relationships, negotiate deals, and drive revenue growth.",
    sector: "Sales",
    requiredSkills: [
      { skillId: "s004", importance: 5 }, // Negotiation
      { skillId: "s005", importance: 5 }, // Persuasion
      { skillId: "s006", importance: 5 }, // Client Relationship Management
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s042", importance: 3 }, // Strategic Planning
      { skillId: "s056", importance: 3 }, // Networking
      { skillId: "s058", importance: 3 }, // Initiative
      { skillId: "s020", importance: 3 }, // Data Analysis
    ],
    salary: { min: 28000, max: 80000, median: 42000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from recruitment/retail management", "Sales apprenticeship", "Internal progression from sales executive"],
  },

  // === CHARITY & PUBLIC SECTOR ===
  {
    id: "uk-2442",
    title: "Policy Analyst",
    alternativeTitles: ["Policy Adviser", "Policy Officer", "Research Officer"],
    description: "Research and analyse policy issues, draft briefings and reports, and provide evidence-based recommendations to decision-makers.",
    sector: "Public Sector",
    requiredSkills: [
      { skillId: "s022", importance: 5 }, // Research
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s021", importance: 5 }, // Critical Thinking
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s025", importance: 3 }, // Decision Making
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Social science degree", "Civil Service Fast Stream", "Career change from academia/journalism/teaching", "Think tank experience"],
  },

  // === HEALTHCARE (non-clinical roles) ===
  {
    id: "uk-2449",
    title: "Healthcare Manager",
    alternativeTitles: ["Clinical Services Manager", "NHS Manager", "Health Services Manager"],
    description: "Manage healthcare services, teams, and budgets. Improve patient outcomes through efficient service delivery and quality improvement.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s026", importance: 4 }, // Process Improvement
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s050", importance: 3 }, // Empathy
      { skillId: "s047", importance: 3 }, // Risk Management
      { skillId: "s025", importance: 3 }, // Decision Making
    ],
    salary: { min: 35000, max: 65000, median: 48000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["NHS Graduate Management Training Scheme", "Career change from clinical roles", "Health management degree", "Progression from team lead"],
  },

  // === EDUCATION (non-teaching) ===
  {
    id: "uk-2312",
    title: "Instructional Designer",
    alternativeTitles: ["Learning Designer", "E-Learning Developer", "Course Designer"],
    description: "Design engaging learning experiences for online and blended courses. Create educational content using instructional design principles.",
    sector: "Education Technology",
    requiredSkills: [
      { skillId: "s157", importance: 5 }, // Curriculum Design
      { skillId: "s155", importance: 4 }, // Innovation
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s113", importance: 3 }, // UX Design
      { skillId: "s160", importance: 3 }, // Teaching
      { skillId: "s152", importance: 3 }, // Video Production
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 28000, max: 50000, median: 38000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["Teaching background", "Career change from education", "E-learning certification", "Graphic design + education experience"],
  },

  // === SUPPLY CHAIN & LOGISTICS ===
  {
    id: "uk-3544",
    title: "Supply Chain Manager",
    alternativeTitles: ["Logistics Manager", "Procurement Manager", "Warehouse Manager"],
    description: "Plan and manage the flow of goods and materials from suppliers to customers. Optimise inventory, logistics, and supplier relationships.",
    sector: "Supply Chain",
    requiredSkills: [
      { skillId: "s049", importance: 5 }, // Operations Management
      { skillId: "s085", importance: 5 }, // Procurement
      { skillId: "s004", importance: 4 }, // Negotiation
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s047", importance: 3 }, // Risk Management
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s118", importance: 3 }, // ERP Systems
    ],
    salary: { min: 30000, max: 60000, median: 42000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Supply chain/logistics degree", "CIPS qualification", "Career change from military/retail operations", "Warehouse progression"],
  },

  // === COMPLIANCE & GOVERNANCE ===
  {
    id: "uk-2461",
    title: "Compliance Officer",
    alternativeTitles: ["Compliance Manager", "Regulatory Affairs Officer", "Risk and Compliance Analyst"],
    description: "Ensure organisations comply with laws, regulations, and internal policies. Conduct audits, assess risks, and advise on regulatory changes.",
    sector: "Finance / Professional Services",
    requiredSkills: [
      { skillId: "s182", importance: 5 }, // Compliance
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s180", importance: 4 }, // Legal Research
      { skillId: "s047", importance: 4 }, // Risk Management
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s021", importance: 3 }, // Critical Thinking
      { skillId: "s082", importance: 3 }, // Auditing
      { skillId: "s002", importance: 3 }, // Verbal Communication
    ],
    salary: { min: 30000, max: 65000, median: 45000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Law degree", "ICA certification", "Career change from legal/finance/audit", "Compliance apprenticeship"],
  },

  // === ENVIRONMENT & SUSTAINABILITY ===
  {
    id: "uk-2113",
    title: "Sustainability Consultant",
    alternativeTitles: ["ESG Analyst", "Environmental Consultant", "Carbon Consultant"],
    description: "Help organisations reduce their environmental impact, develop sustainability strategies, and comply with environmental regulations.",
    sector: "Environment",
    requiredSkills: [
      { skillId: "s192", importance: 5 }, // Environmental Science
      { skillId: "s022", importance: 4 }, // Research
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s042", importance: 3 }, // Strategic Planning
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Environmental science degree", "IEMA qualification", "Career change from science/engineering", "Sustainability certification"],
  },

  // === ADDITIONAL ROLES FOR CAREER CHANGERS ===
  {
    id: "uk-2472",
    title: "UX Researcher",
    alternativeTitles: ["User Researcher", "Design Researcher", "Customer Researcher"],
    description: "Conduct user interviews, surveys, and usability tests to understand user needs and inform product decisions.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s022", importance: 5 },
      { skillId: "s050", importance: 5 },
      { skillId: "s003", importance: 4 },
      { skillId: "s020", importance: 4 },
      { skillId: "s001", importance: 4 },
      { skillId: "s002", importance: 3 },
      { skillId: "s021", importance: 3 },
      { skillId: "s155", importance: 3 },
    ],
    salary: { min: 30000, max: 60000, median: 42000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Psychology/social science degree", "Career change from teaching/counselling", "UX bootcamp", "Market research background"],
  },
  {
    id: "uk-3546",
    title: "Scrum Master",
    alternativeTitles: ["Agile Coach", "Delivery Lead", "Agile Facilitator"],
    description: "Facilitate agile processes, remove blockers, and coach teams on agile methodology to improve delivery speed and quality.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s040", importance: 5 },
      { skillId: "s041", importance: 4 },
      { skillId: "s007", importance: 4 },
      { skillId: "s055", importance: 4 },
      { skillId: "s002", importance: 4 },
      { skillId: "s051", importance: 3 },
      { skillId: "s045", importance: 3 },
      { skillId: "s026", importance: 3 },
    ],
    salary: { min: 40000, max: 75000, median: 55000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["CSM/PSM certification", "Career change from project management/teaching", "Internal move from development", "Agile training"],
  },
  {
    id: "uk-3547",
    title: "Technical Writer",
    alternativeTitles: ["Documentation Specialist", "Content Developer", "API Documentation Writer"],
    description: "Create clear, accurate technical documentation including user guides, API docs, and knowledge base articles.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s001", importance: 5 },
      { skillId: "s054", importance: 5 },
      { skillId: "s021", importance: 4 },
      { skillId: "s024", importance: 3 },
      { skillId: "s022", importance: 3 },
      { skillId: "s100", importance: 3 },
      { skillId: "s051", importance: 3 },
      { skillId: "s053", importance: 3 },
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["English/journalism degree", "Career change from teaching/academia", "Technical background + writing skills", "Freelance writing portfolio"],
  },
  {
    id: "uk-2474",
    title: "Social Media Manager",
    alternativeTitles: ["Social Media Coordinator", "Community Manager", "Social Media Strategist"],
    description: "Plan and execute social media campaigns, create engaging content, manage communities, and analyse performance metrics.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s112", importance: 5 },
      { skillId: "s150", importance: 5 },
      { skillId: "s155", importance: 4 },
      { skillId: "s020", importance: 3 },
      { skillId: "s009", importance: 3 },
      { skillId: "s153", importance: 3 },
      { skillId: "s057", importance: 3 },
      { skillId: "s052", importance: 3 },
    ],
    salary: { min: 24000, max: 45000, median: 32000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["Marketing degree", "Self-taught with portfolio", "Career change from retail/hospitality/admin", "Freelance social media work"],
  },
  {
    id: "uk-3548",
    title: "Recruitment Consultant",
    alternativeTitles: ["Recruiter", "Talent Consultant", "Staffing Consultant"],
    description: "Source candidates, manage client relationships, conduct interviews, and match talent to roles across industries.",
    sector: "Professional Services",
    requiredSkills: [
      { skillId: "s005", importance: 5 },
      { skillId: "s002", importance: 5 },
      { skillId: "s056", importance: 4 },
      { skillId: "s004", importance: 4 },
      { skillId: "s006", importance: 4 },
      { skillId: "s058", importance: 4 },
      { skillId: "s053", importance: 3 },
      { skillId: "s052", importance: 3 },
    ],
    salary: { min: 22000, max: 60000, median: 35000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from sales/customer service/retail", "No degree required", "Strong networkers from any background"],
  },
  {
    id: "uk-2451",
    title: "Copywriter",
    alternativeTitles: ["Content Writer", "Creative Copywriter", "Brand Copywriter"],
    description: "Write persuasive, engaging copy for websites, ads, emails, and marketing materials that drives action.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s001", importance: 5 },
      { skillId: "s009", importance: 5 },
      { skillId: "s150", importance: 4 },
      { skillId: "s005", importance: 4 },
      { skillId: "s022", importance: 3 },
      { skillId: "s155", importance: 3 },
      { skillId: "s054", importance: 3 },
      { skillId: "s052", importance: 3 },
    ],
    salary: { min: 24000, max: 50000, median: 34000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "fully-remote",
    entryRoutes: ["English/journalism degree", "Career change from teaching/PR", "Freelance portfolio", "Copywriting course"],
  },
  {
    id: "uk-3549",
    title: "Estate Agent",
    alternativeTitles: ["Property Consultant", "Lettings Negotiator", "Property Manager"],
    description: "Help people buy, sell, and rent properties. Conduct viewings, negotiate deals, and manage property portfolios.",
    sector: "Property",
    requiredSkills: [
      { skillId: "s004", importance: 5 },
      { skillId: "s005", importance: 5 },
      { skillId: "s002", importance: 4 },
      { skillId: "s006", importance: 4 },
      { skillId: "s058", importance: 4 },
      { skillId: "s133", importance: 3 },
      { skillId: "s056", importance: 3 },
      { skillId: "s053", importance: 3 },
    ],
    salary: { min: 20000, max: 50000, median: 30000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "office",
    entryRoutes: ["No degree required", "Career change from sales/retail/hospitality", "ARLA/NAEA qualification", "Customer-facing experience"],
  },
  {
    id: "uk-2452",
    title: "Business Analyst",
    alternativeTitles: ["Systems Analyst", "Requirements Analyst", "Process Analyst"],
    description: "Bridge the gap between business needs and technology solutions by gathering requirements, mapping processes, and recommending improvements.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s028", importance: 5 },
      { skillId: "s021", importance: 5 },
      { skillId: "s002", importance: 4 },
      { skillId: "s001", importance: 4 },
      { skillId: "s048", importance: 4 },
      { skillId: "s024", importance: 3 },
      { skillId: "s020", importance: 3 },
      { skillId: "s026", importance: 3 },
    ],
    salary: { min: 30000, max: 60000, median: 42000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Any analytical degree", "BCS certification", "Career change from finance/operations/project management", "IIBA certification"],
  },
  {
    id: "uk-2453",
    title: "Event Manager",
    alternativeTitles: ["Events Coordinator", "Conference Manager", "Exhibition Manager"],
    description: "Plan, organise, and deliver events from conferences to weddings. Manage budgets, suppliers, logistics, and on-the-day coordination.",
    sector: "Events",
    requiredSkills: [
      { skillId: "s156", importance: 5 },
      { skillId: "s040", importance: 4 },
      { skillId: "s043", importance: 4 },
      { skillId: "s004", importance: 3 },
      { skillId: "s048", importance: 3 },
      { skillId: "s201", importance: 3 },
      { skillId: "s053", importance: 3 },
      { skillId: "s155", importance: 3 },
    ],
    salary: { min: 24000, max: 45000, median: 32000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Events management degree", "Career change from hospitality/teaching/admin", "Volunteer event organising experience", "PR/marketing background"],
  },
  {
    id: "uk-2454",
    title: "Charity Fundraiser",
    alternativeTitles: ["Development Manager", "Fundraising Manager", "Philanthropy Officer"],
    description: "Raise money for charitable causes through campaigns, events, grant applications, and donor relationship management.",
    sector: "Charity",
    requiredSkills: [
      { skillId: "s005", importance: 5 },
      { skillId: "s001", importance: 4 },
      { skillId: "s006", importance: 4 },
      { skillId: "s156", importance: 3 },
      { skillId: "s042", importance: 3 },
      { skillId: "s043", importance: 3 },
      { skillId: "s056", importance: 3 },
      { skillId: "s206", importance: 3 },
    ],
    salary: { min: 24000, max: 50000, median: 34000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from sales/marketing/teaching", "Volunteer fundraising experience", "IoF qualification"],
  },
  {
    id: "uk-2455",
    title: "Health and Safety Officer",
    alternativeTitles: ["HSE Advisor", "Safety Manager", "EHS Officer"],
    description: "Ensure workplace safety compliance, conduct risk assessments, investigate incidents, and develop safety policies and training.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s173", importance: 5 },
      { skillId: "s047", importance: 5 },
      { skillId: "s054", importance: 4 },
      { skillId: "s001", importance: 4 },
      { skillId: "s161", importance: 3 },
      { skillId: "s182", importance: 3 },
      { skillId: "s024", importance: 3 },
      { skillId: "s002", importance: 3 },
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["NEBOSH qualification", "Career change from construction/manufacturing/military", "IOSH Managing Safely", "Science/engineering degree"],
  },
  {
    id: "uk-2456",
    title: "Quality Manager",
    alternativeTitles: ["Quality Assurance Manager", "Quality Control Manager", "Continuous Improvement Manager"],
    description: "Manage quality systems, conduct audits, drive continuous improvement, and ensure products/services meet standards.",
    sector: "Manufacturing",
    requiredSkills: [
      { skillId: "s029", importance: 5 },
      { skillId: "s026", importance: 5 },
      { skillId: "s054", importance: 4 },
      { skillId: "s020", importance: 3 },
      { skillId: "s041", importance: 3 },
      { skillId: "s082", importance: 3 },
      { skillId: "s182", importance: 3 },
      { skillId: "s001", importance: 3 },
    ],
    salary: { min: 30000, max: 55000, median: 42000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Engineering/science degree", "Six Sigma certification", "Career change from manufacturing/pharma/food", "ISO auditor qualification"],
  },

  // =====================================================
  // === NEW OCCUPATIONS (50+ additions) ===
  // =====================================================

  // === HEALTHCARE (non-clinical) ===
  {
    id: "uk-2457",
    title: "Health Informatics Specialist",
    alternativeTitles: ["Clinical Informatics Analyst", "Health Data Analyst", "NHS Digital Analyst"],
    description: "Manage and analyse healthcare data systems, support digital transformation in NHS trusts, and improve clinical workflows through technology.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s235", importance: 5 }, // Healthcare Informatics
      { skillId: "s020", importance: 5 }, // Data Analysis
      { skillId: "s103", importance: 4 }, // SQL
      { skillId: "s116", importance: 4 }, // IT Support
      { skillId: "s026", importance: 3 }, // Process Improvement
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s236", importance: 3 }, // Medical Terminology
    ],
    salary: { min: 30000, max: 55000, median: 40000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Health informatics degree", "Career change from IT/data analysis into NHS", "NHS Digital graduate scheme", "Clinical background + IT skills"],
  },
  {
    id: "uk-2458",
    title: "Clinical Trials Coordinator",
    alternativeTitles: ["Clinical Research Coordinator", "Study Coordinator", "Research Nurse Coordinator"],
    description: "Coordinate clinical research studies, manage participant recruitment, ensure regulatory compliance, and maintain trial documentation.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s234", importance: 5 }, // Clinical Trials Management
      { skillId: "s040", importance: 4 }, // Project Management
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s182", importance: 4 }, // Compliance
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s050", importance: 3 }, // Empathy
      { skillId: "s278", importance: 3 }, // Record Keeping
    ],
    salary: { min: 26000, max: 45000, median: 34000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Life sciences degree", "Career change from nursing/lab work", "GCP training", "Research assistant progression"],
  },
  {
    id: "uk-2459",
    title: "Patient Liaison Officer",
    alternativeTitles: ["PALS Officer", "Patient Experience Manager", "Patient Advocate"],
    description: "Act as the bridge between patients and healthcare providers, handle complaints, gather feedback, and improve patient experience across services.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s230", importance: 5 }, // Patient Advocacy
      { skillId: "s050", importance: 5 }, // Empathy
      { skillId: "s007", importance: 4 }, // Conflict Resolution
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s277", importance: 4 }, // Complaint Handling
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s278", importance: 3 }, // Record Keeping
      { skillId: "s236", importance: 3 }, // Medical Terminology
    ],
    salary: { min: 24000, max: 38000, median: 30000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "office",
    entryRoutes: ["Any degree", "Career change from customer service/social work", "NHS volunteer experience", "Complaints handling background"],
  },
  {
    id: "uk-2460",
    title: "Healthcare Administrator",
    alternativeTitles: ["Medical Secretary", "Practice Manager", "Clinic Administrator"],
    description: "Manage the day-to-day administration of healthcare settings including GP surgeries, clinics, and hospital departments. Handle scheduling, records, and staff coordination.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s049", importance: 4 }, // Operations Management
      { skillId: "s278", importance: 5 }, // Record Keeping
      { skillId: "s203", importance: 5 }, // Scheduling and Coordination
      { skillId: "s236", importance: 4 }, // Medical Terminology
      { skillId: "s100", importance: 3 }, // Microsoft Office
      { skillId: "s057", importance: 3 }, // Customer Service
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s041", importance: 3 }, // Team Leadership
    ],
    salary: { min: 22000, max: 42000, median: 30000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "office",
    entryRoutes: ["No degree required", "Career change from office administration", "Medical secretary diploma", "NHS admin experience"],
  },

  // === CREATIVE ===
  {
    id: "uk-2462",
    title: "Graphic Designer",
    alternativeTitles: ["Visual Designer", "Brand Designer", "Digital Designer"],
    description: "Create visual concepts for print and digital media including logos, brochures, websites, and marketing materials using design software.",
    sector: "Creative",
    requiredSkills: [
      { skillId: "s151", importance: 5 }, // Graphic Design
      { skillId: "s155", importance: 4 }, // Innovation
      { skillId: "s253", importance: 4 }, // User Interface Design
      { skillId: "s256", importance: 4 }, // Typography
      { skillId: "s255", importance: 3 }, // Colour Theory
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s053", importance: 3 }, // Time Management
    ],
    salary: { min: 22000, max: 45000, median: 32000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Graphic design degree", "Self-taught with portfolio", "Design bootcamp", "Career change with strong visual portfolio"],
  },
  {
    id: "uk-2463",
    title: "Video Editor",
    alternativeTitles: ["Post-Production Editor", "Motion Designer", "Video Producer"],
    description: "Edit raw footage into polished video content for broadcast, social media, corporate communications, and marketing campaigns.",
    sector: "Creative",
    requiredSkills: [
      { skillId: "s152", importance: 5 }, // Video Production
      { skillId: "s251", importance: 4 }, // Motion Graphics
      { skillId: "s252", importance: 3 }, // Sound Design
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s155", importance: 3 }, // Innovation
      { skillId: "s053", importance: 4 }, // Time Management
      { skillId: "s009", importance: 3 }, // Storytelling
      { skillId: "s051", importance: 3 }, // Teamwork
    ],
    salary: { min: 22000, max: 50000, median: 32000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Film/media degree", "Self-taught with YouTube/portfolio", "Freelance video work", "Career change from photography/journalism"],
  },
  {
    id: "uk-2464",
    title: "Photographer",
    alternativeTitles: ["Commercial Photographer", "Portrait Photographer", "Product Photographer"],
    description: "Capture images for commercial, editorial, or personal use. Plan shoots, edit photos, and manage client relationships.",
    sector: "Creative",
    requiredSkills: [
      { skillId: "s153", importance: 5 }, // Photography
      { skillId: "s255", importance: 4 }, // Colour Theory
      { skillId: "s155", importance: 3 }, // Innovation
      { skillId: "s006", importance: 4 }, // Client Relationship Management
      { skillId: "s273", importance: 4 }, // Self-Employment
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s009", importance: 3 }, // Storytelling
      { skillId: "s043", importance: 3 }, // Budget Management
    ],
    salary: { min: 18000, max: 45000, median: 28000 },
    demand: "low",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["Photography degree", "Self-taught with portfolio", "Freelance experience", "Assisting established photographers"],
  },
  {
    id: "uk-2465",
    title: "Interior Designer",
    alternativeTitles: ["Interior Decorator", "Space Planner", "Interior Stylist"],
    description: "Design functional and aesthetically pleasing interior spaces for residential and commercial clients. Select materials, furniture, and colour schemes.",
    sector: "Creative",
    requiredSkills: [
      { skillId: "s257", importance: 5 }, // Interior Design
      { skillId: "s155", importance: 4 }, // Innovation
      { skillId: "s117", importance: 4 }, // CAD
      { skillId: "s006", importance: 4 }, // Client Relationship Management
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s255", importance: 3 }, // Colour Theory
      { skillId: "s004", importance: 3 }, // Negotiation
      { skillId: "s040", importance: 3 }, // Project Management
    ],
    salary: { min: 22000, max: 50000, median: 32000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Interior design degree", "Career change from architecture/retail", "BIID accreditation", "Self-taught with portfolio and projects"],
  },

  // === RETAIL / HOSPITALITY MANAGEMENT ===
  {
    id: "uk-2466",
    title: "Retail Operations Manager",
    alternativeTitles: ["Area Manager Retail", "Regional Manager", "Store Operations Manager", "Multi-Site Manager"],
    description: "Oversee multiple retail locations, manage store teams, drive sales performance, optimise operations, and ensure consistent brand standards.",
    sector: "Retail",
    requiredSkills: [
      { skillId: "s355", importance: 5 }, // Retail Operations
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s049", importance: 4 }, // Operations Management
      { skillId: "s044", importance: 4 }, // Performance Management
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s265", importance: 3 }, // Inventory Management
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s057", importance: 3 }, // Customer Service
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["Retail management progression", "Career change from hospitality management", "Business degree", "Graduate retail scheme"],
  },
  {
    id: "uk-2467",
    title: "Hotel Manager",
    alternativeTitles: ["General Manager Hotel", "Accommodation Manager", "Hospitality Manager"],
    description: "Manage all aspects of hotel operations including guest services, housekeeping, food and beverage, revenue management, and staff.",
    sector: "Hospitality",
    requiredSkills: [
      { skillId: "s352", importance: 5 }, // Hospitality Management
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s057", importance: 4 }, // Customer Service
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s266", importance: 4 }, // Revenue Management
      { skillId: "s049", importance: 3 }, // Operations Management
      { skillId: "s277", importance: 3 }, // Complaint Handling
      { skillId: "s046", importance: 3 }, // Recruitment
    ],
    salary: { min: 26000, max: 55000, median: 35000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["Hospitality management degree", "Internal progression from front desk/duty manager", "Career change from retail management", "Hotel management apprenticeship"],
  },
  {
    id: "uk-2468",
    title: "Restaurant Manager",
    alternativeTitles: ["Food and Beverage Manager", "Catering Manager", "Dining Room Manager"],
    description: "Manage restaurant operations including staff scheduling, food quality, customer experience, budgeting, and health and safety compliance.",
    sector: "Hospitality",
    requiredSkills: [
      { skillId: "s135", importance: 4 }, // Catering
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s057", importance: 5 }, // Customer Service
      { skillId: "s353", importance: 4 }, // Food Safety
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s277", importance: 3 }, // Complaint Handling
      { skillId: "s046", importance: 3 }, // Recruitment
      { skillId: "s200", importance: 3 }, // Multitasking
    ],
    salary: { min: 22000, max: 42000, median: 30000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["Hospitality degree", "Internal progression from front of house", "Career change from retail/events", "Catering qualification"],
  },

  // === TRADES TRANSITIONING TO CORPORATE ===
  {
    id: "uk-2469",
    title: "Quantity Surveyor",
    alternativeTitles: ["Cost Manager", "Commercial Manager Construction", "QS"],
    description: "Manage construction costs from initial estimates through to final accounts. Prepare bills of quantities, value work, and negotiate contracts.",
    sector: "Construction",
    requiredSkills: [
      { skillId: "s243", importance: 5 }, // Quantity Surveying
      { skillId: "s240", importance: 5 }, // Estimating
      { skillId: "s181", importance: 4 }, // Contract Management
      { skillId: "s004", importance: 4 }, // Negotiation
      { skillId: "s130", importance: 3 }, // Construction
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s027", importance: 3 }, // Financial Analysis
      { skillId: "s101", importance: 3 }, // Advanced Excel
    ],
    salary: { min: 28000, max: 65000, median: 45000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["RICS-accredited degree", "Quantity surveying apprenticeship", "Career change from construction trades with numeracy", "Chartered surveyor training"],
  },
  {
    id: "uk-2470",
    title: "Building Surveyor",
    alternativeTitles: ["Chartered Surveyor", "Building Inspector", "Property Surveyor"],
    description: "Assess the condition of buildings, advise on defects and repairs, ensure compliance with building regulations, and manage renovation projects.",
    sector: "Construction",
    requiredSkills: [
      { skillId: "s241", importance: 5 }, // Surveying
      { skillId: "s244", importance: 5 }, // Building Regulations
      { skillId: "s130", importance: 4 }, // Construction
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s117", importance: 3 }, // CAD
    ],
    salary: { min: 28000, max: 60000, median: 42000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["RICS-accredited degree", "Career change from construction trades", "Building surveying apprenticeship", "Environmental health background"],
  },
  {
    id: "uk-2475",
    title: "Facilities Manager",
    alternativeTitles: ["Building Manager", "Premises Manager", "Estate Manager Corporate"],
    description: "Manage building services, maintenance, security, and workspace to ensure a safe, efficient, and productive working environment.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s245", importance: 5 }, // Facilities Management
      { skillId: "s049", importance: 4 }, // Operations Management
      { skillId: "s173", importance: 4 }, // Health and Safety
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s262", importance: 3 }, // Vendor Management
      { skillId: "s041", importance: 3 }, // Team Leadership
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s181", importance: 3 }, // Contract Management
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["IWFM qualification", "Career change from construction trades/military", "Building services engineering degree", "FM apprenticeship"],
  },

  // === PUBLIC SECTOR ===
  {
    id: "uk-2476",
    title: "Civil Servant",
    alternativeTitles: ["Government Official", "Policy Executive", "Fast Streamer", "HEO/SEO"],
    description: "Work within government departments to develop and deliver public policy, manage programmes, and serve the public interest across diverse policy areas.",
    sector: "Public Sector",
    requiredSkills: [
      { skillId: "s340", importance: 5 }, // Policy Development
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s051", importance: 3 }, // Teamwork
      { skillId: "s025", importance: 3 }, // Decision Making
    ],
    salary: { min: 25000, max: 55000, median: 35000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Civil Service Fast Stream", "Career change from private sector/charity", "Civil Service apprenticeship"],
  },
  {
    id: "uk-2477",
    title: "Local Government Officer",
    alternativeTitles: ["Council Officer", "Local Authority Officer", "Borough Officer"],
    description: "Deliver local public services including housing, waste, social care, and community services. Manage budgets, liaise with residents, and implement council policy.",
    sector: "Public Sector",
    requiredSkills: [
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s182", importance: 4 }, // Compliance
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s057", importance: 4 }, // Customer Service
      { skillId: "s275", importance: 3 }, // Report Writing
      { skillId: "s342", importance: 3 }, // Committee Servicing
    ],
    salary: { min: 24000, max: 45000, median: 32000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "National Graduate Development Programme (ngdp)", "Career change from private sector admin/management", "Local government apprenticeship"],
  },
  {
    id: "uk-2478",
    title: "Council Planning Officer",
    alternativeTitles: ["Town Planner", "Planning Officer", "Development Management Officer"],
    description: "Assess planning applications, enforce planning regulations, develop local plans, and balance development needs with community and environmental interests.",
    sector: "Public Sector",
    requiredSkills: [
      { skillId: "s307", importance: 5 }, // Planning Law
      { skillId: "s022", importance: 4 }, // Research
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s025", importance: 4 }, // Decision Making
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s321", importance: 3 }, // GIS
      { skillId: "s244", importance: 3 }, // Building Regulations
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 28000, max: 50000, median: 36000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["RTPI-accredited planning degree", "Career change from architecture/surveying/geography", "Planning apprenticeship", "Graduate planning scheme"],
  },

  // === CHARITY ===
  {
    id: "uk-2479",
    title: "Charity Programme Manager",
    alternativeTitles: ["Programme Director", "Programmes Lead", "Impact Manager"],
    description: "Design, deliver, and evaluate charitable programmes. Manage teams, budgets, and partnerships to achieve social outcomes and demonstrate impact.",
    sector: "Charity",
    requiredSkills: [
      { skillId: "s332", importance: 5 }, // Programme Management
      { skillId: "s040", importance: 4 }, // Project Management
      { skillId: "s331", importance: 4 }, // Monitoring and Evaluation
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s041", importance: 3 }, // Team Leadership
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s333", importance: 3 }, // Community Development
    ],
    salary: { min: 30000, max: 55000, median: 40000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree + charity experience", "Career change from project management/public sector", "Volunteering progression", "Social science degree"],
  },
  {
    id: "uk-2480",
    title: "Grants Officer",
    alternativeTitles: ["Grants Manager", "Grants Coordinator", "Funding Officer"],
    description: "Manage grant-making processes, assess funding applications, monitor grant performance, and build relationships with funded organisations.",
    sector: "Charity",
    requiredSkills: [
      { skillId: "s330", importance: 5 }, // Grant Writing
      { skillId: "s027", importance: 4 }, // Financial Analysis
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s331", importance: 3 }, // Monitoring and Evaluation
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s182", importance: 3 }, // Compliance
    ],
    salary: { min: 26000, max: 45000, median: 34000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from finance/admin/teaching", "Charity sector experience", "Grant writing training"],
  },
  {
    id: "uk-2481",
    title: "Community Development Worker",
    alternativeTitles: ["Community Worker", "Community Engagement Officer", "Outreach Worker"],
    description: "Work with communities to identify needs, develop projects, build capacity, and empower residents to improve their local area.",
    sector: "Charity",
    requiredSkills: [
      { skillId: "s333", importance: 5 }, // Community Development
      { skillId: "s270", importance: 5 }, // Community Organising
      { skillId: "s050", importance: 4 }, // Empathy
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s206", importance: 3 }, // Volunteer Coordination
      { skillId: "s040", importance: 3 }, // Project Management
      { skillId: "s008", importance: 3 }, // Cross-Cultural Communication
      { skillId: "s205", importance: 3 }, // Advocacy
    ],
    salary: { min: 22000, max: 38000, median: 28000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["Community development degree", "Career change from social work/teaching/youth work", "Volunteering progression", "JNC-recognised qualification"],
  },

  // === TECH (additional) ===
  {
    id: "uk-2482",
    title: "DevOps Engineer",
    alternativeTitles: ["Site Reliability Engineer", "Platform Engineer", "Infrastructure Engineer"],
    description: "Build and maintain CI/CD pipelines, manage cloud infrastructure, automate deployments, and ensure system reliability and scalability.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s108", importance: 5 }, // Cloud Computing
      { skillId: "s216", importance: 5 }, // Docker
      { skillId: "s219", importance: 5 }, // CI/CD
      { skillId: "s107", importance: 4 }, // Software Development
      { skillId: "s215", importance: 4 }, // AWS
      { skillId: "s217", importance: 4 }, // Git
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s119", importance: 3 }, // Automation
    ],
    salary: { min: 40000, max: 85000, median: 60000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["Computer science degree", "Career change from software development/IT support", "AWS/Azure certifications", "DevOps bootcamp"],
  },
  {
    id: "uk-2483",
    title: "QA Tester",
    alternativeTitles: ["Software Tester", "Test Engineer", "Quality Assurance Engineer", "Test Analyst"],
    description: "Design and execute test plans, identify software defects, write bug reports, and work with developers to ensure software quality before release.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s224", importance: 5 }, // Testing and QA Software
      { skillId: "s029", importance: 5 }, // Quality Assurance
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s024", importance: 4 }, // Problem Solving
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s021", importance: 3 }, // Critical Thinking
      { skillId: "s107", importance: 3 }, // Software Development
      { skillId: "s218", importance: 3 }, // Agile Methodology
    ],
    salary: { min: 25000, max: 55000, median: 38000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["ISTQB certification", "Career change from any detail-oriented role", "IT degree", "Coding bootcamp + testing focus"],
  },
  {
    id: "uk-2484",
    title: "IT Manager",
    alternativeTitles: ["Head of IT", "IT Director", "Technology Manager", "IS Manager"],
    description: "Lead IT teams, manage infrastructure and systems, oversee IT budgets, and align technology strategy with business objectives.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s116", importance: 4 }, // IT Support
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s042", importance: 4 }, // Strategic Planning
      { skillId: "s043", importance: 4 }, // Budget Management
      { skillId: "s108", importance: 3 }, // Cloud Computing
      { skillId: "s109", importance: 3 }, // Cybersecurity
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s221", importance: 3 }, // ITIL
    ],
    salary: { min: 40000, max: 80000, median: 55000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["IT degree", "Progression from IT support/systems admin", "ITIL/PRINCE2 certifications", "Career change from engineering management"],
  },
  {
    id: "uk-2485",
    title: "Solutions Architect",
    alternativeTitles: ["Technical Architect", "Enterprise Architect", "Cloud Architect"],
    description: "Design complex technical solutions, define system architecture, evaluate technologies, and guide development teams to build scalable, reliable systems.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s107", importance: 5 }, // Software Development
      { skillId: "s108", importance: 5 }, // Cloud Computing
      { skillId: "s042", importance: 4 }, // Strategic Planning
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s215", importance: 4 }, // AWS
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s222", importance: 3 }, // API Development
    ],
    salary: { min: 55000, max: 100000, median: 75000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Senior developer progression", "AWS/Azure Solutions Architect certification", "Career change from engineering management", "TOGAF certification"],
  },

  // === FINANCE (additional) ===
  {
    id: "uk-2486",
    title: "Mortgage Advisor",
    alternativeTitles: ["Mortgage Broker", "Mortgage Consultant", "Lending Advisor"],
    description: "Advise clients on mortgage products, assess affordability, submit applications, and guide customers through the home-buying process.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s284", importance: 5 }, // Mortgage Advisory
      { skillId: "s006", importance: 5 }, // Client Relationship Management
      { skillId: "s004", importance: 4 }, // Negotiation
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s027", importance: 3 }, // Financial Analysis
      { skillId: "s058", importance: 3 }, // Initiative
    ],
    salary: { min: 25000, max: 60000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["CeMAP qualification", "Career change from banking/estate agency/financial services", "Mortgage network training", "Financial services apprenticeship"],
  },
  {
    id: "uk-2487",
    title: "Insurance Underwriter",
    alternativeTitles: ["Risk Underwriter", "Commercial Underwriter", "Personal Lines Underwriter"],
    description: "Assess insurance applications, evaluate risk, set premiums, and decide whether to accept or reject coverage based on guidelines and analysis.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s285", importance: 5 }, // Insurance Underwriting
      { skillId: "s047", importance: 5 }, // Risk Management
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s025", importance: 4 }, // Decision Making
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s021", importance: 3 }, // Critical Thinking
      { skillId: "s004", importance: 3 }, // Negotiation
      { skillId: "s001", importance: 3 }, // Written Communication
    ],
    salary: { min: 25000, max: 60000, median: 40000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["CII qualification", "Career change from claims/broking", "Actuarial science degree", "Insurance apprenticeship"],
  },
  {
    id: "uk-2488",
    title: "Credit Analyst",
    alternativeTitles: ["Credit Risk Analyst", "Lending Analyst", "Credit Controller Senior"],
    description: "Assess the creditworthiness of individuals or businesses, analyse financial statements, and make lending recommendations.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s286", importance: 5 }, // Credit Analysis
      { skillId: "s027", importance: 5 }, // Financial Analysis
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s021", importance: 4 }, // Critical Thinking
      { skillId: "s101", importance: 3 }, // Advanced Excel
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s025", importance: 3 }, // Decision Making
    ],
    salary: { min: 28000, max: 55000, median: 40000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Finance/economics degree", "Career change from accounting/banking", "CFA Level 1", "Credit management qualification"],
  },
  {
    id: "uk-2489",
    title: "Accounts Manager",
    alternativeTitles: ["Finance Manager", "Financial Controller", "Accounts Team Leader"],
    description: "Manage the finance function, oversee accounts payable and receivable, produce management accounts, and ensure accurate financial reporting.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s080", importance: 5 }, // Accounting
      { skillId: "s283", importance: 5 }, // Management Reporting
      { skillId: "s041", importance: 4 }, // Team Leadership
      { skillId: "s081", importance: 4 }, // Tax
      { skillId: "s082", importance: 3 }, // Auditing
      { skillId: "s101", importance: 3 }, // Advanced Excel
      { skillId: "s118", importance: 3 }, // ERP Systems
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 35000, max: 65000, median: 48000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["ACCA/CIMA/ACA qualification", "Career progression from accounts assistant", "Finance degree", "AAT progression route"],
  },

  // === LEGAL ===
  {
    id: "uk-2490",
    title: "Paralegal",
    alternativeTitles: ["Legal Assistant", "Legal Executive", "Litigation Assistant"],
    description: "Support solicitors by conducting legal research, drafting documents, managing case files, and liaising with clients and courts.",
    sector: "Legal",
    requiredSkills: [
      { skillId: "s180", importance: 5 }, // Legal Research
      { skillId: "s304", importance: 4 }, // Legal Drafting
      { skillId: "s300", importance: 4 }, // Case Management
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s053", importance: 3 }, // Time Management
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s278", importance: 3 }, // Record Keeping
    ],
    salary: { min: 20000, max: 40000, median: 28000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Law degree", "CILEx qualification", "Career change from admin/finance with legal interest", "Legal secretary progression"],
  },
  {
    id: "uk-2491",
    title: "Conveyancer",
    alternativeTitles: ["Property Solicitor", "Licensed Conveyancer", "Property Lawyer"],
    description: "Handle the legal transfer of property ownership, conduct searches, review contracts, and guide clients through buying and selling transactions.",
    sector: "Legal",
    requiredSkills: [
      { skillId: "s303", importance: 5 }, // Conveyancing
      { skillId: "s180", importance: 4 }, // Legal Research
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s006", importance: 4 }, // Client Relationship Management
      { skillId: "s053", importance: 4 }, // Time Management
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s304", importance: 3 }, // Legal Drafting
      { skillId: "s278", importance: 3 }, // Record Keeping
    ],
    salary: { min: 24000, max: 50000, median: 35000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["CLC licence", "Law degree + LPC", "Career change from estate agency/paralegal", "Conveyancing apprenticeship"],
  },
  {
    id: "uk-2492",
    title: "Legal Secretary",
    alternativeTitles: ["Legal PA", "Legal Administrator", "Legal Support Assistant"],
    description: "Provide administrative support to solicitors and legal teams including document preparation, diary management, and client correspondence.",
    sector: "Legal",
    requiredSkills: [
      { skillId: "s278", importance: 5 }, // Record Keeping
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s100", importance: 4 }, // Microsoft Office
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s203", importance: 4 }, // Scheduling and Coordination
      { skillId: "s053", importance: 3 }, // Time Management
      { skillId: "s236", importance: 3 }, // Medical Terminology (legal terminology)
      { skillId: "s057", importance: 3 }, // Customer Service
    ],
    salary: { min: 20000, max: 35000, median: 26000 },
    demand: "medium",
    growthOutlook: "declining",
    remoteOptions: "hybrid",
    entryRoutes: ["Legal secretary diploma", "Career change from general admin/PA", "Paralegal progression", "No degree required with strong admin skills"],
  },

  // === MEDIA / PR ===
  {
    id: "uk-2493",
    title: "PR Manager",
    alternativeTitles: ["Public Relations Manager", "Communications Manager", "Media Relations Manager"],
    description: "Manage an organisation's reputation through media relations, press releases, events, and strategic communications planning.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s310", importance: 5 }, // Public Relations
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s009", importance: 4 }, // Storytelling
      { skillId: "s048", importance: 4 }, // Stakeholder Management
      { skillId: "s312", importance: 3 }, // Crisis Communications
      { skillId: "s056", importance: 3 }, // Networking
      { skillId: "s042", importance: 3 }, // Strategic Planning
      { skillId: "s112", importance: 3 }, // Social Media Management
    ],
    salary: { min: 30000, max: 60000, median: 42000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["PR/journalism/media degree", "Career change from journalism/marketing", "CIPR qualification", "PR agency progression"],
  },
  {
    id: "uk-2494",
    title: "Journalist",
    alternativeTitles: ["Reporter", "News Reporter", "Editor", "Correspondent"],
    description: "Research, write, and edit news stories and features for print, online, broadcast, or podcast. Conduct interviews and investigate stories.",
    sector: "Media",
    requiredSkills: [
      { skillId: "s313", importance: 5 }, // Journalism
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s022", importance: 5 }, // Research
      { skillId: "s009", importance: 4 }, // Storytelling
      { skillId: "s053", importance: 4 }, // Time Management
      { skillId: "s058", importance: 3 }, // Initiative
      { skillId: "s003", importance: 3 }, // Active Listening
      { skillId: "s052", importance: 3 }, // Adaptability
    ],
    salary: { min: 20000, max: 50000, median: 30000 },
    demand: "low",
    growthOutlook: "declining",
    remoteOptions: "hybrid",
    entryRoutes: ["Journalism degree", "NCTJ qualification", "Career change from English/teaching/PR", "Blogging/freelance portfolio"],
  },
  {
    id: "uk-2495",
    title: "Communications Officer",
    alternativeTitles: ["Corporate Communications Officer", "Internal Communications Officer", "Comms Manager"],
    description: "Develop and deliver internal and external communications strategies, create content, manage channels, and support organisational messaging.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s314", importance: 5 }, // Internal Communications
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s150", importance: 4 }, // Content Creation
      { skillId: "s112", importance: 3 }, // Social Media Management
      { skillId: "s310", importance: 3 }, // Public Relations
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s009", importance: 3 }, // Storytelling
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 26000, max: 48000, median: 34000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["English/media/marketing degree", "Career change from journalism/teaching/admin", "CIPR qualification", "Charity or public sector comms experience"],
  },

  // === EDUCATION (non-teaching) ===
  {
    id: "uk-2496",
    title: "School Business Manager",
    alternativeTitles: ["School Business Director", "School Bursar", "Academy Business Manager"],
    description: "Manage the business operations of a school including finance, HR, premises, health and safety, and compliance.",
    sector: "Education",
    requiredSkills: [
      { skillId: "s294", importance: 5 }, // School Business Management
      { skillId: "s043", importance: 5 }, // Budget Management
      { skillId: "s080", importance: 4 }, // Accounting
      { skillId: "s049", importance: 4 }, // Operations Management
      { skillId: "s173", importance: 3 }, // Health and Safety
      { skillId: "s046", importance: 3 }, // Recruitment
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s041", importance: 3 }, // Team Leadership
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "office",
    entryRoutes: ["DSBM/CSBM qualification", "Career change from finance/operations management", "School admin progression", "Accountancy background"],
  },
  {
    id: "uk-2497",
    title: "Admissions Officer",
    alternativeTitles: ["Admissions Manager", "Student Recruitment Officer", "Enrolment Manager"],
    description: "Manage student admissions processes, provide guidance to applicants, organise open days, and ensure fair and compliant selection procedures.",
    sector: "Education",
    requiredSkills: [
      { skillId: "s295", importance: 5 }, // Admissions
      { skillId: "s057", importance: 4 }, // Customer Service
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s278", importance: 3 }, // Record Keeping
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s182", importance: 3 }, // Compliance
      { skillId: "s156", importance: 3 }, // Event Planning
    ],
    salary: { min: 24000, max: 40000, median: 30000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Career change from admin/customer service", "University admin progression", "Marketing background"],
  },
  {
    id: "uk-2498",
    title: "Education Consultant",
    alternativeTitles: ["Education Adviser", "School Improvement Consultant", "Curriculum Consultant"],
    description: "Advise schools and educational organisations on improving teaching quality, curriculum design, Ofsted preparation, and strategic development.",
    sector: "Education",
    requiredSkills: [
      { skillId: "s296", importance: 5 }, // Education Consultancy
      { skillId: "s160", importance: 5 }, // Teaching
      { skillId: "s042", importance: 4 }, // Strategic Planning
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s161", importance: 3 }, // Training Delivery
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s001", importance: 3 }, // Written Communication
      { skillId: "s006", importance: 3 }, // Client Relationship Management
    ],
    salary: { min: 35000, max: 65000, median: 48000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Senior teaching experience (headteacher/deputy)", "Ofsted inspector background", "Career change from school leadership", "Subject specialist consultancy"],
  },

  // === CUSTOMER-FACING WITH TRANSFERABLE SKILLS ===
  {
    id: "uk-2499",
    title: "Cabin Crew",
    alternativeTitles: ["Flight Attendant", "Air Steward", "Air Stewardess", "In-Flight Crew"],
    description: "Ensure passenger safety and comfort during flights, deliver in-flight service, handle emergencies, and provide exceptional customer care.",
    sector: "Aviation",
    requiredSkills: [
      { skillId: "s361", importance: 5 }, // Passenger Service
      { skillId: "s360", importance: 5 }, // Aviation Safety
      { skillId: "s057", importance: 4 }, // Customer Service
      { skillId: "s008", importance: 4 }, // Cross-Cultural Communication
      { skillId: "s201", importance: 4 }, // Crisis Management
      { skillId: "s052", importance: 3 }, // Adaptability
      { skillId: "s051", importance: 3 }, // Teamwork
      { skillId: "s208", importance: 3 }, // First Aid
    ],
    salary: { min: 20000, max: 40000, median: 28000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["No degree required", "Airline training programme", "Career change from hospitality/retail", "Customer service background with languages"],
  },
  {
    id: "uk-2500",
    title: "Call Centre Manager",
    alternativeTitles: ["Contact Centre Manager", "Customer Service Manager", "Customer Operations Manager"],
    description: "Manage call centre teams, monitor performance metrics, improve customer satisfaction, and optimise processes for efficiency.",
    sector: "Customer Service",
    requiredSkills: [
      { skillId: "s041", importance: 5 }, // Team Leadership
      { skillId: "s057", importance: 5 }, // Customer Service
      { skillId: "s044", importance: 4 }, // Performance Management
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s026", importance: 3 }, // Process Improvement
      { skillId: "s046", importance: 3 }, // Recruitment
      { skillId: "s277", importance: 3 }, // Complaint Handling
      { skillId: "s110", importance: 3 }, // CRM Systems
    ],
    salary: { min: 28000, max: 50000, median: 36000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree", "Internal progression from team leader", "Career change from retail/hospitality management", "Customer service experience"],
  },
  {
    id: "uk-2501",
    title: "Retail Buyer",
    alternativeTitles: ["Merchandiser", "Category Buyer", "Buying Manager"],
    description: "Select and purchase products for retail businesses, negotiate with suppliers, analyse sales trends, and manage product ranges.",
    sector: "Retail",
    requiredSkills: [
      { skillId: "s351", importance: 5 }, // Retail Buying
      { skillId: "s004", importance: 5 }, // Negotiation
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s085", importance: 4 }, // Procurement
      { skillId: "s155", importance: 3 }, // Innovation
      { skillId: "s042", importance: 3 }, // Strategic Planning
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 24000, max: 55000, median: 35000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Fashion/business degree", "Retail graduate scheme", "Career change from visual merchandising/retail management", "Buying assistant progression"],
  },

  // === ADDITIONAL CROSS-SECTOR ROLES ===
  {
    id: "uk-2502",
    title: "Accountant",
    alternativeTitles: ["Chartered Accountant", "Management Accountant", "Financial Accountant"],
    description: "Prepare financial statements, manage tax compliance, audit accounts, and provide financial advice to individuals or organisations.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s080", importance: 5 }, // Accounting
      { skillId: "s081", importance: 4 }, // Tax
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s101", importance: 4 }, // Advanced Excel
      { skillId: "s082", importance: 3 }, // Auditing
      { skillId: "s282", importance: 3 }, // VAT Returns
      { skillId: "s283", importance: 3 }, // Management Reporting
      { skillId: "s118", importance: 3 }, // ERP Systems
    ],
    salary: { min: 28000, max: 60000, median: 42000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["ACCA/ACA/CIMA qualification", "Accounting degree", "AAT progression", "Career change from bookkeeping/finance admin"],
  },
  {
    id: "uk-2503",
    title: "Teacher",
    alternativeTitles: ["Secondary Teacher", "Primary Teacher", "Classroom Teacher", "NQT", "ECT"],
    description: "Plan and deliver lessons, assess student progress, manage classroom behaviour, and support the development of young people.",
    sector: "Education",
    requiredSkills: [
      { skillId: "s160", importance: 5 }, // Teaching
      { skillId: "s157", importance: 4 }, // Curriculum Design
      { skillId: "s290", importance: 4 }, // Behaviour Management
      { skillId: "s162", importance: 4 }, // Assessment
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s050", importance: 3 }, // Empathy
      { skillId: "s163", importance: 3 }, // Safeguarding
      { skillId: "s293", importance: 3 }, // Pastoral Care
    ],
    salary: { min: 28000, max: 48000, median: 36000 },
    demand: "high",
    growthOutlook: "stable",
    remoteOptions: "on-site",
    entryRoutes: ["PGCE", "School Direct", "Teach First", "Career change via subject knowledge enhancement course"],
  },
  {
    id: "uk-2504",
    title: "SEO Specialist",
    alternativeTitles: ["SEO Manager", "SEO Analyst", "Search Marketing Specialist", "Organic Search Specialist"],
    description: "Improve website visibility in search engines through technical optimisation, content strategy, link building, and keyword research.",
    sector: "Marketing",
    requiredSkills: [
      { skillId: "s370", importance: 5 }, // SEO
      { skillId: "s020", importance: 4 }, // Data Analysis
      { skillId: "s371", importance: 4 }, // Google Analytics
      { skillId: "s150", importance: 3 }, // Content Creation
      { skillId: "s106", importance: 3 }, // Web Development
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s021", importance: 3 }, // Critical Thinking
      { skillId: "s001", importance: 3 }, // Written Communication
    ],
    salary: { min: 25000, max: 55000, median: 35000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["Digital marketing qualification", "Self-taught with own projects", "Career change from content writing/journalism", "Marketing degree"],
  },
  {
    id: "uk-2505",
    title: "Salesforce Administrator",
    alternativeTitles: ["CRM Administrator", "Salesforce Consultant", "CRM Analyst"],
    description: "Configure and maintain Salesforce platforms, manage user access, build reports and dashboards, and automate business processes.",
    sector: "Technology",
    requiredSkills: [
      { skillId: "s213", importance: 5 }, // Salesforce Administration
      { skillId: "s110", importance: 5 }, // CRM Systems
      { skillId: "s028", importance: 4 }, // Business Analysis
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s020", importance: 3 }, // Data Analysis
      { skillId: "s161", importance: 3 }, // Training Delivery
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s054", importance: 3 }, // Attention to Detail
    ],
    salary: { min: 30000, max: 60000, median: 42000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "fully-remote",
    entryRoutes: ["Salesforce Admin certification (ADM 201)", "Career change from admin/sales/operations", "Trailhead self-study", "CRM experience in any platform"],
  },
  {
    id: "uk-2506",
    title: "Data Protection Officer",
    alternativeTitles: ["DPO", "Privacy Officer", "Information Governance Manager"],
    description: "Ensure organisational compliance with data protection legislation (GDPR), manage subject access requests, conduct privacy impact assessments, and advise on data handling.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s306", importance: 5 }, // Data Protection Law
      { skillId: "s182", importance: 5 }, // Compliance
      { skillId: "s047", importance: 4 }, // Risk Management
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s161", importance: 3 }, // Training Delivery
      { skillId: "s048", importance: 3 }, // Stakeholder Management
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s022", importance: 3 }, // Research
    ],
    salary: { min: 35000, max: 70000, median: 50000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["CIPP/CIPM certification", "Career change from legal/IT/compliance", "Law degree", "Information governance background"],
  },
  {
    id: "uk-2507",
    title: "Bookkeeper",
    alternativeTitles: ["Accounts Assistant", "Finance Assistant", "Purchase Ledger Clerk"],
    description: "Record financial transactions, reconcile bank statements, manage invoices, and maintain accurate financial records for businesses.",
    sector: "Finance",
    requiredSkills: [
      { skillId: "s080", importance: 5 }, // Accounting
      { skillId: "s281", importance: 5 }, // Invoicing
      { skillId: "s054", importance: 5 }, // Attention to Detail
      { skillId: "s280", importance: 3 }, // Credit Control
      { skillId: "s100", importance: 4 }, // Microsoft Office
      { skillId: "s282", importance: 3 }, // VAT Returns
      { skillId: "s083", importance: 3 }, // Payroll
      { skillId: "s278", importance: 3 }, // Record Keeping
    ],
    salary: { min: 20000, max: 32000, median: 25000 },
    demand: "medium",
    growthOutlook: "declining",
    remoteOptions: "hybrid",
    entryRoutes: ["AAT qualification", "No degree required", "Career change from admin/retail", "Bookkeeping course (ICB)"],
  },
  {
    id: "uk-2508",
    title: "Construction Site Manager",
    alternativeTitles: ["Site Agent", "Project Manager Construction", "Build Manager"],
    description: "Manage construction projects on-site, coordinate subcontractors, ensure health and safety compliance, and deliver projects on time and budget.",
    sector: "Construction",
    requiredSkills: [
      { skillId: "s130", importance: 5 }, // Construction
      { skillId: "s242", importance: 5 }, // Site Supervision
      { skillId: "s173", importance: 5 }, // Health and Safety
      { skillId: "s040", importance: 4 }, // Project Management
      { skillId: "s041", importance: 4 }, // Team Leadership
      { skillId: "s043", importance: 3 }, // Budget Management
      { skillId: "s024", importance: 3 }, // Problem Solving
      { skillId: "s244", importance: 3 }, // Building Regulations
    ],
    salary: { min: 35000, max: 65000, median: 48000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["Construction management degree", "Trades progression with SMSTS", "HNC/HND in construction", "Construction apprenticeship"],
  },
  {
    id: "uk-2509",
    title: "Nurse",
    alternativeTitles: ["Registered Nurse", "Staff Nurse", "RN", "Ward Nurse"],
    description: "Provide direct patient care, administer medications, assess patient needs, and work with multidisciplinary teams to deliver treatment plans.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s170", importance: 5 }, // Patient Care
      { skillId: "s171", importance: 5 }, // Clinical Assessment
      { skillId: "s172", importance: 4 }, // Medication Administration
      { skillId: "s050", importance: 4 }, // Empathy
      { skillId: "s201", importance: 3 }, // Crisis Management
      { skillId: "s051", importance: 3 }, // Teamwork
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s237", importance: 3 }, // Care Planning
    ],
    salary: { min: 27000, max: 42000, median: 33000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["Nursing degree (BSc/MSc)", "Nursing apprenticeship", "Return to practice programme", "Overseas nurse adaptation"],
  },
  {
    id: "uk-2510",
    title: "Executive Assistant",
    alternativeTitles: ["Personal Assistant", "PA", "EA", "C-Suite Assistant"],
    description: "Provide high-level administrative support to senior executives including diary management, travel arrangements, meeting preparation, and correspondence.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s203", importance: 5 }, // Scheduling and Coordination
      { skillId: "s100", importance: 4 }, // Microsoft Office
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s053", importance: 4 }, // Time Management
      { skillId: "s002", importance: 3 }, // Verbal Communication
      { skillId: "s052", importance: 3 }, // Adaptability
      { skillId: "s276", importance: 3 }, // Meeting Facilitation
    ],
    salary: { min: 25000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["No degree required", "Career progression from admin assistant", "PA diploma", "Career change from any organised, professional role"],
  },
  {
    id: "uk-2511",
    title: "Counsellor",
    alternativeTitles: ["Therapist", "Psychotherapist", "Talking Therapist", "Mental Health Counsellor"],
    description: "Provide therapeutic support to individuals dealing with mental health challenges, relationship issues, grief, or life transitions using evidence-based approaches.",
    sector: "Healthcare",
    requiredSkills: [
      { skillId: "s174", importance: 5 }, // Mental Health Support
      { skillId: "s238", importance: 5 }, // Therapeutic Techniques
      { skillId: "s003", importance: 5 }, // Active Listening
      { skillId: "s050", importance: 5 }, // Empathy
      { skillId: "s007", importance: 3 }, // Conflict Resolution
      { skillId: "s278", importance: 3 }, // Record Keeping
      { skillId: "s163", importance: 3 }, // Safeguarding
      { skillId: "s204", importance: 3 }, // Patience
    ],
    salary: { min: 24000, max: 45000, median: 32000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["BACP-accredited diploma", "Career change from teaching/social work/nursing", "Psychology degree + counselling training", "Voluntary counselling experience"],
  },
  {
    id: "uk-2512",
    title: "Charity Communications Manager",
    alternativeTitles: ["Charity Marketing Manager", "NGO Communications Lead", "Third Sector Comms Manager"],
    description: "Lead communications for a charity including storytelling, campaigns, media relations, digital content, and supporter engagement to drive awareness and donations.",
    sector: "Charity",
    requiredSkills: [
      { skillId: "s150", importance: 5 }, // Content Creation
      { skillId: "s310", importance: 4 }, // Public Relations
      { skillId: "s009", importance: 4 }, // Storytelling
      { skillId: "s112", importance: 4 }, // Social Media Management
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s042", importance: 3 }, // Strategic Planning
      { skillId: "s372", importance: 3 }, // Email Marketing
      { skillId: "s043", importance: 3 }, // Budget Management
    ],
    salary: { min: 28000, max: 48000, median: 36000 },
    demand: "medium",
    growthOutlook: "stable",
    remoteOptions: "hybrid",
    entryRoutes: ["Marketing/communications degree", "Career change from journalism/PR/marketing", "Charity sector volunteering", "Digital marketing experience"],
  },
  {
    id: "uk-2513",
    title: "Electrician",
    alternativeTitles: ["Electrical Engineer", "Electrical Installer", "Spark"],
    description: "Install, maintain, and repair electrical systems in residential and commercial properties, ensuring compliance with safety regulations.",
    sector: "Trades",
    requiredSkills: [
      { skillId: "s131", importance: 5 }, // Electrical Work
      { skillId: "s024", importance: 4 }, // Problem Solving
      { skillId: "s173", importance: 5 }, // Health and Safety
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s057", importance: 3 }, // Customer Service
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s244", importance: 3 }, // Building Regulations
      { skillId: "s273", importance: 3 }, // Self-Employment
    ],
    salary: { min: 25000, max: 50000, median: 36000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["Electrical apprenticeship", "18th Edition qualification", "Career change with EAL Level 3 Diploma", "AM2 assessment"],
  },
  {
    id: "uk-2514",
    title: "Plumber",
    alternativeTitles: ["Heating Engineer", "Gas Engineer", "Plumbing and Heating Engineer"],
    description: "Install, maintain, and repair plumbing and heating systems including boilers, radiators, bathrooms, and water systems.",
    sector: "Trades",
    requiredSkills: [
      { skillId: "s132", importance: 5 }, // Plumbing
      { skillId: "s024", importance: 4 }, // Problem Solving
      { skillId: "s173", importance: 5 }, // Health and Safety
      { skillId: "s057", importance: 3 }, // Customer Service
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s273", importance: 3 }, // Self-Employment
      { skillId: "s006", importance: 3 }, // Client Relationship Management
      { skillId: "s240", importance: 3 }, // Estimating
    ],
    salary: { min: 24000, max: 48000, median: 34000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["Plumbing apprenticeship", "NVQ Level 2/3 in Plumbing", "Career change with intensive training course", "Gas Safe registration"],
  },
  {
    id: "uk-2515",
    title: "Social Worker",
    alternativeTitles: ["Children's Social Worker", "Adult Social Worker", "Mental Health Social Worker"],
    description: "Support vulnerable individuals and families, assess needs, develop care plans, protect children and adults at risk, and coordinate with other agencies.",
    sector: "Public Sector",
    requiredSkills: [
      { skillId: "s050", importance: 5 }, // Empathy
      { skillId: "s163", importance: 5 }, // Safeguarding
      { skillId: "s334", importance: 4 }, // Safeguarding Adults
      { skillId: "s300", importance: 4 }, // Case Management
      { skillId: "s001", importance: 4 }, // Written Communication
      { skillId: "s201", importance: 3 }, // Crisis Management
      { skillId: "s007", importance: 3 }, // Conflict Resolution
      { skillId: "s205", importance: 3 }, // Advocacy
    ],
    salary: { min: 28000, max: 45000, median: 35000 },
    demand: "high",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Social work degree (BA/MA)", "Social Work England registration", "Career change from teaching/nursing/youth work", "Step Up to Social Work programme"],
  },
  {
    id: "uk-2516",
    title: "Bid Writer",
    alternativeTitles: ["Tender Writer", "Proposal Writer", "Bid Manager"],
    description: "Write compelling bids, tenders, and proposals to win contracts. Manage the bid process, coordinate responses, and meet submission deadlines.",
    sector: "Cross-Industry",
    requiredSkills: [
      { skillId: "s330", importance: 5 }, // Grant Writing
      { skillId: "s001", importance: 5 }, // Written Communication
      { skillId: "s005", importance: 4 }, // Persuasion
      { skillId: "s040", importance: 4 }, // Project Management
      { skillId: "s054", importance: 4 }, // Attention to Detail
      { skillId: "s053", importance: 3 }, // Time Management
      { skillId: "s022", importance: 3 }, // Research
      { skillId: "s048", importance: 3 }, // Stakeholder Management
    ],
    salary: { min: 28000, max: 55000, median: 38000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "hybrid",
    entryRoutes: ["Any degree with strong writing skills", "Career change from marketing/PR/journalism", "APMP certification", "Bid coordinator progression"],
  },
  {
    id: "uk-2517",
    title: "Personal Trainer",
    alternativeTitles: ["Fitness Coach", "Gym Instructor", "Strength and Conditioning Coach"],
    description: "Design and deliver personalised fitness programmes, motivate clients, track progress, and provide nutrition guidance to help achieve health goals.",
    sector: "Health and Fitness",
    requiredSkills: [
      { skillId: "s055", importance: 4 }, // Mentoring
      { skillId: "s050", importance: 4 }, // Empathy
      { skillId: "s002", importance: 4 }, // Verbal Communication
      { skillId: "s006", importance: 4 }, // Client Relationship Management
      { skillId: "s233", importance: 3 }, // Health Promotion
      { skillId: "s273", importance: 3 }, // Self-Employment
      { skillId: "s058", importance: 3 }, // Initiative
      { skillId: "s208", importance: 3 }, // First Aid
    ],
    salary: { min: 18000, max: 40000, median: 26000 },
    demand: "medium",
    growthOutlook: "growing",
    remoteOptions: "on-site",
    entryRoutes: ["Level 3 Personal Training qualification", "Career change from any active role", "Sports science degree", "CIMSPA registration"],
  },
  {
    id: "uk-2518",
    title: "Librarian",
    alternativeTitles: ["Information Professional", "Knowledge Manager", "Library Manager"],
    description: "Manage library collections, support research and learning, curate resources, run events, and help people access information effectively.",
    sector: "Education",
    requiredSkills: [
      { skillId: "s022", importance: 5 }, // Research
      { skillId: "s278", importance: 4 }, // Record Keeping
      { skillId: "s057", importance: 4 }, // Customer Service
      { skillId: "s054", importance: 3 }, // Attention to Detail
      { skillId: "s274", importance: 3 }, // Digital Literacy
      { skillId: "s156", importance: 3 }, // Event Planning
      { skillId: "s333", importance: 3 }, // Community Development
      { skillId: "s001", importance: 3 }, // Written Communication
    ],
    salary: { min: 22000, max: 40000, median: 30000 },
    demand: "low",
    growthOutlook: "declining",
    remoteOptions: "on-site",
    entryRoutes: ["CILIP-accredited library degree", "Career change from teaching/research", "Library assistant progression", "Information management background"],
  },
];

// Helper: get occupation by ID
export function getOccupationById(id: string): Occupation | undefined {
  return OCCUPATIONS.find((o) => o.id === id);
}

// Helper: get all occupation titles for Claude prompt
export function getOccupationSummariesForPrompt(): string {
  return OCCUPATIONS.map(
    (o) => `${o.id}:${o.title}|${o.salary.median}|${o.demand}|${o.sector}`
  ).join("\n");
}
