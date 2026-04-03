// Skills taxonomy derived from O*NET and ESCO
// Curated for UK labour market relevance
// Each skill has a unique ID, name, category, and related skill IDs for adjacency matching

export type SkillCategory =
  | "communication"
  | "analytical"
  | "technical"
  | "management"
  | "interpersonal"
  | "creative"
  | "physical"
  | "financial"
  | "digital"
  | "scientific"
  | "legal"
  | "education"
  | "healthcare"
  | "life";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[]; // alternative names people might use
  relatedSkillIds: string[]; // for adjacency matching
}

// Core skills taxonomy (~500 most important, expandable later)
export const SKILLS: Skill[] = [
  // === COMMUNICATION ===
  { id: "s001", name: "Written Communication", category: "communication", aliases: ["writing", "report writing", "business writing", "copywriting", "technical writing", "content writing"], relatedSkillIds: ["s002", "s003", "s150"] },
  { id: "s002", name: "Verbal Communication", category: "communication", aliases: ["public speaking", "presentations", "presenting", "speaking", "oratory"], relatedSkillIds: ["s001", "s003", "s004"] },
  { id: "s003", name: "Active Listening", category: "communication", aliases: ["listening skills", "attentive listening"], relatedSkillIds: ["s002", "s004", "s050"] },
  { id: "s004", name: "Negotiation", category: "communication", aliases: ["negotiating", "deal making", "bargaining", "contract negotiation"], relatedSkillIds: ["s002", "s005", "s050"] },
  { id: "s005", name: "Persuasion", category: "communication", aliases: ["influencing", "influence", "convincing"], relatedSkillIds: ["s002", "s004", "s006"] },
  { id: "s006", name: "Client Relationship Management", category: "communication", aliases: ["client management", "account management", "client liaison", "customer relationships", "stakeholder management"], relatedSkillIds: ["s005", "s004", "s050"] },
  { id: "s007", name: "Conflict Resolution", category: "communication", aliases: ["mediation", "dispute resolution", "de-escalation"], relatedSkillIds: ["s003", "s004", "s050"] },
  { id: "s008", name: "Cross-Cultural Communication", category: "communication", aliases: ["multicultural communication", "diversity awareness", "cultural sensitivity"], relatedSkillIds: ["s001", "s002", "s003"] },
  { id: "s009", name: "Storytelling", category: "communication", aliases: ["narrative", "brand storytelling"], relatedSkillIds: ["s001", "s002", "s150"] },
  { id: "s010", name: "Email Communication", category: "communication", aliases: ["professional email", "correspondence"], relatedSkillIds: ["s001", "s006"] },

  // === ANALYTICAL ===
  { id: "s020", name: "Data Analysis", category: "analytical", aliases: ["data analytics", "statistical analysis", "quantitative analysis", "data interpretation"], relatedSkillIds: ["s021", "s022", "s023"] },
  { id: "s021", name: "Critical Thinking", category: "analytical", aliases: ["analytical thinking", "logical thinking", "reasoning", "problem analysis"], relatedSkillIds: ["s020", "s024", "s025"] },
  { id: "s022", name: "Research", category: "analytical", aliases: ["research skills", "desk research", "market research", "user research", "academic research"], relatedSkillIds: ["s020", "s021", "s023"] },
  { id: "s023", name: "Statistical Analysis", category: "analytical", aliases: ["statistics", "statistical modelling", "regression analysis", "hypothesis testing"], relatedSkillIds: ["s020", "s022", "s120"] },
  { id: "s024", name: "Problem Solving", category: "analytical", aliases: ["troubleshooting", "root cause analysis", "issue resolution", "debugging"], relatedSkillIds: ["s021", "s025", "s026"] },
  { id: "s025", name: "Decision Making", category: "analytical", aliases: ["judgement", "sound judgement", "risk assessment"], relatedSkillIds: ["s021", "s024", "s040"] },
  { id: "s026", name: "Process Improvement", category: "analytical", aliases: ["lean", "six sigma", "kaizen", "continuous improvement", "operational efficiency", "workflow optimisation"], relatedSkillIds: ["s024", "s025", "s040"] },
  { id: "s027", name: "Financial Analysis", category: "analytical", aliases: ["financial modelling", "financial forecasting", "budgeting analysis", "cost analysis", "P&L analysis"], relatedSkillIds: ["s020", "s023", "s080"] },
  { id: "s028", name: "Business Analysis", category: "analytical", aliases: ["requirements gathering", "requirements analysis", "business requirements", "gap analysis"], relatedSkillIds: ["s022", "s024", "s026"] },
  { id: "s029", name: "Quality Assurance", category: "analytical", aliases: ["QA", "quality control", "quality management", "testing", "inspection"], relatedSkillIds: ["s024", "s026", "s028"] },

  // === MANAGEMENT ===
  { id: "s040", name: "Project Management", category: "management", aliases: ["programme management", "project planning", "project delivery", "agile", "scrum", "waterfall", "prince2", "PMP"], relatedSkillIds: ["s041", "s042", "s043"] },
  { id: "s041", name: "Team Leadership", category: "management", aliases: ["people management", "team management", "line management", "staff management", "leading teams"], relatedSkillIds: ["s040", "s042", "s044"] },
  { id: "s042", name: "Strategic Planning", category: "management", aliases: ["strategy", "strategic thinking", "business strategy", "long-term planning", "vision setting"], relatedSkillIds: ["s040", "s041", "s025"] },
  { id: "s043", name: "Budget Management", category: "management", aliases: ["budgeting", "financial management", "cost management", "expense management", "resource allocation"], relatedSkillIds: ["s040", "s027", "s080"] },
  { id: "s044", name: "Performance Management", category: "management", aliases: ["appraisals", "KPIs", "target setting", "employee development", "coaching staff"], relatedSkillIds: ["s041", "s045", "s046"] },
  { id: "s045", name: "Change Management", category: "management", aliases: ["transformation", "organisational change", "restructuring"], relatedSkillIds: ["s042", "s044", "s041"] },
  { id: "s046", name: "Recruitment", category: "management", aliases: ["hiring", "talent acquisition", "interviewing candidates", "headhunting"], relatedSkillIds: ["s041", "s044", "s050"] },
  { id: "s047", name: "Risk Management", category: "management", aliases: ["risk assessment", "risk mitigation", "risk analysis", "health and safety"], relatedSkillIds: ["s025", "s040", "s042"] },
  { id: "s048", name: "Stakeholder Management", category: "management", aliases: ["stakeholder engagement", "managing expectations", "senior stakeholders"], relatedSkillIds: ["s006", "s004", "s042"] },
  { id: "s049", name: "Operations Management", category: "management", aliases: ["operations", "operational management", "supply chain management", "logistics management"], relatedSkillIds: ["s040", "s026", "s043"] },

  // === INTERPERSONAL ===
  { id: "s050", name: "Empathy", category: "interpersonal", aliases: ["emotional intelligence", "EQ", "understanding others", "compassion"], relatedSkillIds: ["s003", "s007", "s051"] },
  { id: "s051", name: "Teamwork", category: "interpersonal", aliases: ["collaboration", "working in teams", "team player", "cooperative working"], relatedSkillIds: ["s050", "s002", "s052"] },
  { id: "s052", name: "Adaptability", category: "interpersonal", aliases: ["flexibility", "resilience", "coping with change", "versatility"], relatedSkillIds: ["s051", "s053", "s024"] },
  { id: "s053", name: "Time Management", category: "interpersonal", aliases: ["prioritisation", "meeting deadlines", "workload management", "self-organisation"], relatedSkillIds: ["s040", "s052", "s054"] },
  { id: "s054", name: "Attention to Detail", category: "interpersonal", aliases: ["accuracy", "meticulousness", "thoroughness", "precision"], relatedSkillIds: ["s029", "s053", "s001"] },
  { id: "s055", name: "Mentoring", category: "interpersonal", aliases: ["coaching", "training others", "developing others", "knowledge transfer"], relatedSkillIds: ["s041", "s044", "s050"] },
  { id: "s056", name: "Networking", category: "interpersonal", aliases: ["professional networking", "relationship building", "building connections"], relatedSkillIds: ["s006", "s002", "s005"] },
  { id: "s057", name: "Customer Service", category: "interpersonal", aliases: ["customer support", "client service", "customer care", "customer satisfaction", "helpdesk"], relatedSkillIds: ["s050", "s003", "s007"] },
  { id: "s058", name: "Initiative", category: "interpersonal", aliases: ["self-motivation", "proactivity", "self-starter", "entrepreneurial"], relatedSkillIds: ["s052", "s024", "s025"] },
  { id: "s059", name: "Cultural Awareness", category: "interpersonal", aliases: ["diversity and inclusion", "inclusivity", "equality"], relatedSkillIds: ["s008", "s050", "s051"] },

  // === TECHNICAL / IT ===
  { id: "s100", name: "Microsoft Office", category: "technical", aliases: ["MS Office", "Word", "Excel", "PowerPoint", "Outlook", "Office 365", "Microsoft 365"], relatedSkillIds: ["s101", "s102", "s020"] },
  { id: "s101", name: "Advanced Excel", category: "technical", aliases: ["spreadsheets", "pivot tables", "VLOOKUP", "macros", "VBA", "formulas"], relatedSkillIds: ["s100", "s020", "s023"] },
  { id: "s102", name: "Data Visualisation", category: "technical", aliases: ["Tableau", "Power BI", "dashboards", "charts", "infographics", "data presentation"], relatedSkillIds: ["s020", "s101", "s103"] },
  { id: "s103", name: "SQL", category: "technical", aliases: ["database queries", "MySQL", "PostgreSQL", "SQL Server", "database management"], relatedSkillIds: ["s020", "s104", "s102"] },
  { id: "s104", name: "Python", category: "technical", aliases: ["Python programming", "pandas", "numpy", "scripting"], relatedSkillIds: ["s103", "s105", "s020"] },
  { id: "s105", name: "JavaScript", category: "technical", aliases: ["JS", "TypeScript", "Node.js", "React", "frontend development"], relatedSkillIds: ["s104", "s106", "s107"] },
  { id: "s106", name: "Web Development", category: "technical", aliases: ["HTML", "CSS", "frontend", "backend", "full-stack", "web design"], relatedSkillIds: ["s105", "s107", "s150"] },
  { id: "s107", name: "Software Development", category: "technical", aliases: ["programming", "coding", "software engineering", "application development"], relatedSkillIds: ["s104", "s105", "s106"] },
  { id: "s108", name: "Cloud Computing", category: "technical", aliases: ["AWS", "Azure", "Google Cloud", "GCP", "cloud infrastructure", "DevOps"], relatedSkillIds: ["s107", "s109", "s103"] },
  { id: "s109", name: "Cybersecurity", category: "technical", aliases: ["information security", "network security", "IT security", "GDPR", "data protection"], relatedSkillIds: ["s108", "s047", "s107"] },
  { id: "s110", name: "CRM Systems", category: "technical", aliases: ["Salesforce", "HubSpot", "customer relationship management", "CRM software"], relatedSkillIds: ["s006", "s100", "s057"] },
  { id: "s111", name: "Digital Marketing", category: "technical", aliases: ["SEO", "SEM", "PPC", "Google Ads", "social media marketing", "content marketing", "email marketing"], relatedSkillIds: ["s150", "s112", "s020"] },
  { id: "s112", name: "Social Media Management", category: "technical", aliases: ["social media", "Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter", "X"], relatedSkillIds: ["s111", "s150", "s001"] },
  { id: "s113", name: "UX Design", category: "technical", aliases: ["user experience", "UI design", "user interface", "interaction design", "wireframing", "prototyping", "Figma"], relatedSkillIds: ["s022", "s106", "s150"] },
  { id: "s114", name: "Data Science", category: "technical", aliases: ["machine learning", "AI", "artificial intelligence", "deep learning", "predictive modelling"], relatedSkillIds: ["s020", "s023", "s104"] },
  { id: "s115", name: "Project Management Software", category: "technical", aliases: ["Jira", "Asana", "Trello", "Monday.com", "MS Project", "Notion"], relatedSkillIds: ["s040", "s100", "s107"] },
  { id: "s116", name: "IT Support", category: "technical", aliases: ["technical support", "helpdesk", "troubleshooting IT", "systems administration"], relatedSkillIds: ["s024", "s057", "s108"] },
  { id: "s117", name: "CAD", category: "technical", aliases: ["AutoCAD", "computer-aided design", "3D modelling", "SolidWorks", "Revit", "BIM"], relatedSkillIds: ["s106", "s054", "s130"] },
  { id: "s118", name: "ERP Systems", category: "technical", aliases: ["SAP", "Oracle", "enterprise resource planning", "business systems"], relatedSkillIds: ["s100", "s049", "s103"] },
  { id: "s119", name: "Automation", category: "technical", aliases: ["process automation", "RPA", "workflow automation", "scripting"], relatedSkillIds: ["s026", "s104", "s107"] },

  // === CREATIVE ===
  { id: "s150", name: "Content Creation", category: "creative", aliases: ["content writing", "blogging", "copywriting", "content strategy"], relatedSkillIds: ["s001", "s111", "s112"] },
  { id: "s151", name: "Graphic Design", category: "creative", aliases: ["visual design", "Adobe Creative Suite", "Photoshop", "Illustrator", "InDesign", "Canva"], relatedSkillIds: ["s113", "s150", "s152"] },
  { id: "s152", name: "Video Production", category: "creative", aliases: ["video editing", "filming", "videography", "Adobe Premiere", "Final Cut"], relatedSkillIds: ["s151", "s150", "s153"] },
  { id: "s153", name: "Photography", category: "creative", aliases: ["photo editing", "Lightroom", "product photography"], relatedSkillIds: ["s151", "s152", "s054"] },
  { id: "s154", name: "Brand Strategy", category: "creative", aliases: ["branding", "brand management", "brand development", "brand identity"], relatedSkillIds: ["s042", "s111", "s150"] },
  { id: "s155", name: "Innovation", category: "creative", aliases: ["creative thinking", "ideation", "brainstorming", "design thinking"], relatedSkillIds: ["s024", "s021", "s113"] },
  { id: "s156", name: "Event Planning", category: "creative", aliases: ["event management", "event coordination", "conference planning", "event organisation"], relatedSkillIds: ["s040", "s043", "s048"] },
  { id: "s157", name: "Curriculum Design", category: "creative", aliases: ["course design", "instructional design", "learning design", "lesson planning"], relatedSkillIds: ["s160", "s155", "s001"] },

  // === EDUCATION & TRAINING ===
  { id: "s160", name: "Teaching", category: "education", aliases: ["instruction", "lecturing", "tutoring", "classroom management", "pedagogy"], relatedSkillIds: ["s002", "s055", "s157"] },
  { id: "s161", name: "Training Delivery", category: "education", aliases: ["facilitation", "workshop facilitation", "corporate training", "L&D"], relatedSkillIds: ["s160", "s002", "s055"] },
  { id: "s162", name: "Assessment", category: "education", aliases: ["grading", "evaluation", "marking", "student assessment", "competency assessment"], relatedSkillIds: ["s160", "s054", "s029"] },
  { id: "s163", name: "Safeguarding", category: "education", aliases: ["child protection", "DBS", "vulnerable adults", "welfare"], relatedSkillIds: ["s047", "s050", "s160"] },
  { id: "s164", name: "Special Educational Needs", category: "education", aliases: ["SEN", "SEND", "learning disabilities", "differentiation", "inclusive education"], relatedSkillIds: ["s160", "s050", "s052"] },

  // === FINANCIAL ===
  { id: "s080", name: "Accounting", category: "financial", aliases: ["bookkeeping", "accounts", "financial accounting", "management accounting", "ACCA", "CIMA", "ACA"], relatedSkillIds: ["s027", "s081", "s082"] },
  { id: "s081", name: "Tax", category: "financial", aliases: ["taxation", "tax planning", "corporation tax", "VAT", "income tax", "tax compliance"], relatedSkillIds: ["s080", "s082", "s027"] },
  { id: "s082", name: "Auditing", category: "financial", aliases: ["internal audit", "external audit", "compliance audit", "financial audit"], relatedSkillIds: ["s080", "s029", "s054"] },
  { id: "s083", name: "Payroll", category: "financial", aliases: ["payroll management", "PAYE", "salary processing"], relatedSkillIds: ["s080", "s100", "s054"] },
  { id: "s084", name: "Financial Planning", category: "financial", aliases: ["wealth management", "investment planning", "retirement planning", "financial advice"], relatedSkillIds: ["s027", "s080", "s042"] },
  { id: "s085", name: "Procurement", category: "financial", aliases: ["purchasing", "supplier management", "vendor management", "sourcing", "tendering"], relatedSkillIds: ["s004", "s043", "s049"] },

  // === HEALTHCARE ===
  { id: "s170", name: "Patient Care", category: "healthcare", aliases: ["clinical care", "nursing care", "patient assessment", "bedside manner"], relatedSkillIds: ["s050", "s171", "s172"] },
  { id: "s171", name: "Clinical Assessment", category: "healthcare", aliases: ["diagnosis", "triage", "patient assessment", "medical assessment"], relatedSkillIds: ["s170", "s021", "s024"] },
  { id: "s172", name: "Medication Administration", category: "healthcare", aliases: ["dispensing", "prescribing", "pharmacology"], relatedSkillIds: ["s170", "s054", "s047"] },
  { id: "s173", name: "Health and Safety", category: "healthcare", aliases: ["H&S", "COSHH", "risk assessments", "workplace safety", "manual handling"], relatedSkillIds: ["s047", "s029", "s163"] },
  { id: "s174", name: "Mental Health Support", category: "healthcare", aliases: ["counselling", "therapy", "psychological support", "CBT", "mental health first aid"], relatedSkillIds: ["s050", "s003", "s170"] },

  // === LEGAL ===
  { id: "s180", name: "Legal Research", category: "legal", aliases: ["case law research", "legal analysis", "legislation review"], relatedSkillIds: ["s022", "s021", "s001"] },
  { id: "s181", name: "Contract Management", category: "legal", aliases: ["contract review", "contract drafting", "legal agreements", "SLAs"], relatedSkillIds: ["s180", "s054", "s004"] },
  { id: "s182", name: "Compliance", category: "legal", aliases: ["regulatory compliance", "governance", "FCA", "GDPR compliance", "regulatory affairs"], relatedSkillIds: ["s180", "s047", "s082"] },
  { id: "s183", name: "Intellectual Property", category: "legal", aliases: ["patents", "trademarks", "copyright", "IP law"], relatedSkillIds: ["s180", "s181", "s022"] },

  // === SCIENTIFIC ===
  { id: "s190", name: "Laboratory Skills", category: "scientific", aliases: ["lab work", "lab techniques", "laboratory procedures", "pipetting"], relatedSkillIds: ["s054", "s029", "s191"] },
  { id: "s191", name: "Scientific Writing", category: "scientific", aliases: ["academic writing", "paper writing", "journal articles", "peer review"], relatedSkillIds: ["s001", "s022", "s190"] },
  { id: "s192", name: "Environmental Science", category: "scientific", aliases: ["sustainability", "environmental management", "carbon footprint", "ESG"], relatedSkillIds: ["s022", "s190", "s047"] },

  // === PHYSICAL / TRADES ===
  { id: "s130", name: "Construction", category: "physical", aliases: ["building", "site management", "construction management", "CSCS"], relatedSkillIds: ["s040", "s047", "s173"] },
  { id: "s131", name: "Electrical Work", category: "physical", aliases: ["electrical installation", "wiring", "electrician", "18th edition"], relatedSkillIds: ["s130", "s024", "s047"] },
  { id: "s132", name: "Plumbing", category: "physical", aliases: ["plumber", "heating", "gas safe", "pipework"], relatedSkillIds: ["s130", "s024", "s047"] },
  { id: "s133", name: "Driving", category: "physical", aliases: ["HGV", "LGV", "forklift", "delivery driving", "fleet management", "clean driving licence"], relatedSkillIds: ["s049", "s053", "s047"] },
  { id: "s134", name: "Mechanical Engineering", category: "physical", aliases: ["mechanics", "machinery", "maintenance engineering", "plant maintenance"], relatedSkillIds: ["s024", "s117", "s130"] },
  { id: "s135", name: "Catering", category: "physical", aliases: ["cooking", "food preparation", "chef", "food hygiene", "kitchen management"], relatedSkillIds: ["s053", "s049", "s173"] },

  // === LIFE SKILLS (from parenting, caring, volunteering) ===
  { id: "s200", name: "Multitasking", category: "life", aliases: ["juggling priorities", "managing multiple tasks", "parallel working"], relatedSkillIds: ["s053", "s052", "s040"] },
  { id: "s201", name: "Crisis Management", category: "life", aliases: ["emergency response", "staying calm under pressure", "dealing with emergencies"], relatedSkillIds: ["s024", "s025", "s052"] },
  { id: "s202", name: "Household Budget Management", category: "life", aliases: ["family budgeting", "personal finance", "money management"], relatedSkillIds: ["s043", "s080", "s084"] },
  { id: "s203", name: "Scheduling and Coordination", category: "life", aliases: ["diary management", "appointment scheduling", "coordinating activities", "logistics"], relatedSkillIds: ["s053", "s040", "s049"] },
  { id: "s204", name: "Patience", category: "life", aliases: ["tolerance", "perseverance", "calm temperament"], relatedSkillIds: ["s050", "s052", "s160"] },
  { id: "s205", name: "Advocacy", category: "life", aliases: ["championing others", "speaking up", "representing others"], relatedSkillIds: ["s005", "s002", "s050"] },
  { id: "s206", name: "Volunteer Coordination", category: "life", aliases: ["volunteer management", "community organising", "fundraising"], relatedSkillIds: ["s041", "s156", "s043"] },
  { id: "s207", name: "Caring", category: "life", aliases: ["caregiving", "looking after dependents", "elderly care", "childcare"], relatedSkillIds: ["s050", "s170", "s204"] },
  { id: "s208", name: "First Aid", category: "life", aliases: ["emergency first aid", "CPR", "first responder"], relatedSkillIds: ["s201", "s170", "s173"] },
  { id: "s209", name: "DIY and Repairs", category: "life", aliases: ["home maintenance", "fixing things", "handyperson"], relatedSkillIds: ["s024", "s130", "s131"] },

  // =====================================================
  // === NEW SKILLS (s210+) ===
  // =====================================================

  // === MORE TECHNICAL ===
  { id: "s210", name: "R Programming", category: "technical", aliases: ["R", "R Studio", "R language", "statistical programming"], relatedSkillIds: ["s023", "s104", "s020"] },
  { id: "s211", name: "Tableau", category: "technical", aliases: ["Tableau Desktop", "Tableau Server", "Tableau Public"], relatedSkillIds: ["s102", "s020", "s101"] },
  { id: "s212", name: "Power BI", category: "technical", aliases: ["Microsoft Power BI", "Power BI Desktop", "DAX", "Power Query"], relatedSkillIds: ["s102", "s101", "s020"] },
  { id: "s213", name: "Salesforce Administration", category: "technical", aliases: ["Salesforce Admin", "SFDC", "Salesforce CRM", "Salesforce configuration"], relatedSkillIds: ["s110", "s100", "s028"] },
  { id: "s214", name: "SAP", category: "technical", aliases: ["SAP ERP", "SAP S/4HANA", "SAP FICO", "SAP MM", "SAP SD"], relatedSkillIds: ["s118", "s049", "s080"] },
  { id: "s215", name: "AWS", category: "technical", aliases: ["Amazon Web Services", "EC2", "S3", "Lambda", "AWS Solutions Architect"], relatedSkillIds: ["s108", "s107", "s109"] },
  { id: "s216", name: "Docker", category: "technical", aliases: ["containerisation", "Docker Compose", "Kubernetes", "container orchestration"], relatedSkillIds: ["s108", "s107", "s215"] },
  { id: "s217", name: "Git", category: "technical", aliases: ["version control", "GitHub", "GitLab", "Bitbucket", "source control"], relatedSkillIds: ["s107", "s105", "s104"] },
  { id: "s218", name: "Agile Methodology", category: "technical", aliases: ["Scrum", "Kanban", "sprint planning", "agile frameworks", "SAFe"], relatedSkillIds: ["s040", "s115", "s051"] },
  { id: "s219", name: "CI/CD", category: "technical", aliases: ["continuous integration", "continuous deployment", "Jenkins", "GitHub Actions", "pipeline automation"], relatedSkillIds: ["s216", "s217", "s107"] },
  { id: "s220", name: "Networking", category: "technical", aliases: ["network administration", "TCP/IP", "DNS", "firewall management", "LAN/WAN"], relatedSkillIds: ["s116", "s109", "s108"] },
  { id: "s221", name: "ITIL", category: "technical", aliases: ["IT service management", "ITSM", "service desk", "incident management", "change management IT"], relatedSkillIds: ["s116", "s026", "s040"] },
  { id: "s222", name: "API Development", category: "technical", aliases: ["REST API", "GraphQL", "API design", "web services", "microservices"], relatedSkillIds: ["s107", "s105", "s103"] },
  { id: "s223", name: "Mobile Development", category: "technical", aliases: ["iOS development", "Android development", "React Native", "Flutter", "app development"], relatedSkillIds: ["s107", "s105", "s113"] },
  { id: "s224", name: "Testing and QA Software", category: "technical", aliases: ["software testing", "test automation", "Selenium", "Cypress", "unit testing", "integration testing"], relatedSkillIds: ["s029", "s107", "s024"] },
  { id: "s225", name: "Business Intelligence", category: "technical", aliases: ["BI tools", "reporting tools", "SSRS", "Crystal Reports", "Looker"], relatedSkillIds: ["s102", "s020", "s103"] },
  { id: "s226", name: "SharePoint", category: "technical", aliases: ["SharePoint administration", "SharePoint Online", "intranet management"], relatedSkillIds: ["s100", "s116", "s040"] },
  { id: "s227", name: "Google Workspace", category: "technical", aliases: ["Google Docs", "Google Sheets", "Google Drive", "G Suite", "Google Apps"], relatedSkillIds: ["s100", "s051", "s010"] },

  // === MORE HEALTHCARE ===
  { id: "s230", name: "Patient Advocacy", category: "healthcare", aliases: ["patient liaison", "patient rights", "patient voice", "PALS"], relatedSkillIds: ["s205", "s050", "s170"] },
  { id: "s231", name: "Clinical Governance", category: "healthcare", aliases: ["clinical standards", "clinical audit", "healthcare quality", "CQC compliance"], relatedSkillIds: ["s182", "s029", "s047"] },
  { id: "s232", name: "Infection Control", category: "healthcare", aliases: ["infection prevention", "IPC", "hygiene protocols", "decontamination"], relatedSkillIds: ["s173", "s047", "s054"] },
  { id: "s233", name: "Health Promotion", category: "healthcare", aliases: ["public health", "health education", "wellness programmes", "preventive care"], relatedSkillIds: ["s161", "s002", "s170"] },
  { id: "s234", name: "Clinical Trials Management", category: "healthcare", aliases: ["clinical research", "trial coordination", "GCP", "research protocols"], relatedSkillIds: ["s022", "s040", "s182"] },
  { id: "s235", name: "Healthcare Informatics", category: "healthcare", aliases: ["health informatics", "clinical informatics", "NHS IT systems", "EPR", "electronic patient records"], relatedSkillIds: ["s116", "s020", "s170"] },
  { id: "s236", name: "Medical Terminology", category: "healthcare", aliases: ["clinical terminology", "medical coding", "ICD-10", "healthcare language"], relatedSkillIds: ["s170", "s054", "s001"] },
  { id: "s237", name: "Care Planning", category: "healthcare", aliases: ["care coordination", "care pathways", "personalised care", "discharge planning"], relatedSkillIds: ["s170", "s040", "s050"] },
  { id: "s238", name: "Therapeutic Techniques", category: "healthcare", aliases: ["CBT", "person-centred therapy", "motivational interviewing", "talking therapies"], relatedSkillIds: ["s174", "s003", "s050"] },

  // === MORE TRADES / CONSTRUCTION ===
  { id: "s240", name: "Estimating", category: "physical", aliases: ["cost estimating", "quantity take-off", "pricing", "bill of quantities"], relatedSkillIds: ["s027", "s130", "s054"] },
  { id: "s241", name: "Surveying", category: "physical", aliases: ["land surveying", "building surveying", "measured surveys", "topographic surveys"], relatedSkillIds: ["s130", "s117", "s054"] },
  { id: "s242", name: "Site Supervision", category: "physical", aliases: ["site management", "foreman", "site foreman", "construction supervision", "SMSTS"], relatedSkillIds: ["s130", "s041", "s173"] },
  { id: "s243", name: "Quantity Surveying", category: "physical", aliases: ["QS", "cost management construction", "contract administration construction", "RICS"], relatedSkillIds: ["s240", "s130", "s181"] },
  { id: "s244", name: "Building Regulations", category: "physical", aliases: ["building control", "planning regulations", "Part L", "Part B", "approved documents"], relatedSkillIds: ["s182", "s130", "s241"] },
  { id: "s245", name: "Facilities Management", category: "physical", aliases: ["FM", "building management", "premises management", "soft services", "hard services"], relatedSkillIds: ["s049", "s043", "s173"] },
  { id: "s246", name: "Painting and Decorating", category: "physical", aliases: ["decorating", "painter", "interior finishing"], relatedSkillIds: ["s130", "s054", "s209"] },
  { id: "s247", name: "Carpentry", category: "physical", aliases: ["joinery", "woodwork", "cabinet making", "fitting"], relatedSkillIds: ["s130", "s054", "s209"] },
  { id: "s248", name: "Landscaping", category: "physical", aliases: ["garden design", "grounds maintenance", "horticulture"], relatedSkillIds: ["s130", "s155", "s054"] },

  // === MORE CREATIVE ===
  { id: "s250", name: "Art Direction", category: "creative", aliases: ["creative direction", "visual direction", "art director"], relatedSkillIds: ["s151", "s154", "s155"] },
  { id: "s251", name: "Motion Graphics", category: "creative", aliases: ["After Effects", "animation", "animated graphics", "kinetic typography"], relatedSkillIds: ["s152", "s151", "s155"] },
  { id: "s252", name: "Sound Design", category: "creative", aliases: ["audio production", "audio editing", "sound engineering", "podcast production", "mixing"], relatedSkillIds: ["s152", "s054", "s155"] },
  { id: "s253", name: "User Interface Design", category: "creative", aliases: ["UI design", "visual interface", "screen design", "component design", "design systems"], relatedSkillIds: ["s113", "s151", "s155"] },
  { id: "s254", name: "Illustration", category: "creative", aliases: ["digital illustration", "drawing", "sketching", "editorial illustration"], relatedSkillIds: ["s151", "s155", "s150"] },
  { id: "s255", name: "Colour Theory", category: "creative", aliases: ["colour palette", "colour grading", "colour correction", "colour science"], relatedSkillIds: ["s151", "s153", "s250"] },
  { id: "s256", name: "Typography", category: "creative", aliases: ["typesetting", "font selection", "layout design", "print design"], relatedSkillIds: ["s151", "s150", "s054"] },
  { id: "s257", name: "Interior Design", category: "creative", aliases: ["space planning", "interior decoration", "interior styling", "space design"], relatedSkillIds: ["s117", "s155", "s006"] },
  { id: "s258", name: "3D Visualisation", category: "creative", aliases: ["3D rendering", "CGI", "architectural visualisation", "SketchUp", "Blender"], relatedSkillIds: ["s117", "s151", "s257"] },

  // === MORE BUSINESS / MANAGEMENT ===
  { id: "s260", name: "Strategic Partnerships", category: "management", aliases: ["partner management", "alliance management", "joint ventures", "business partnerships"], relatedSkillIds: ["s004", "s042", "s006"] },
  { id: "s261", name: "Business Development", category: "management", aliases: ["new business", "market development", "growth strategy", "revenue generation"], relatedSkillIds: ["s004", "s005", "s042"] },
  { id: "s262", name: "Vendor Management", category: "management", aliases: ["supplier management", "third-party management", "outsourcing management"], relatedSkillIds: ["s085", "s004", "s048"] },
  { id: "s263", name: "Contract Negotiation", category: "management", aliases: ["deal negotiation", "commercial negotiation", "terms negotiation"], relatedSkillIds: ["s004", "s181", "s085"] },
  { id: "s264", name: "Service Delivery Management", category: "management", aliases: ["service management", "SLA management", "client delivery", "delivery management"], relatedSkillIds: ["s049", "s006", "s040"] },
  { id: "s265", name: "Inventory Management", category: "management", aliases: ["stock control", "stock management", "warehouse management", "inventory control"], relatedSkillIds: ["s049", "s020", "s118"] },
  { id: "s266", name: "Revenue Management", category: "management", aliases: ["yield management", "pricing strategy", "revenue optimisation"], relatedSkillIds: ["s027", "s020", "s042"] },
  { id: "s267", name: "Franchise Management", category: "management", aliases: ["franchise operations", "franchise development", "brand compliance"], relatedSkillIds: ["s049", "s041", "s182"] },
  { id: "s268", name: "Property Management", category: "management", aliases: ["estate management", "tenancy management", "rent collection", "landlord duties"], relatedSkillIds: ["s245", "s006", "s181"] },

  // === MORE LIFE SKILLS ===
  { id: "s270", name: "Community Organising", category: "life", aliases: ["community engagement", "grassroots organising", "community building", "campaigning"], relatedSkillIds: ["s206", "s002", "s005"] },
  { id: "s271", name: "Language Skills", category: "life", aliases: ["foreign languages", "bilingual", "multilingual", "translation", "interpreting"], relatedSkillIds: ["s008", "s001", "s002"] },
  { id: "s272", name: "Cultural Mediation", category: "life", aliases: ["cultural bridging", "intercultural mediation", "cross-cultural facilitation"], relatedSkillIds: ["s008", "s007", "s271"] },
  { id: "s273", name: "Self-Employment", category: "life", aliases: ["freelancing", "sole trader", "running a business", "entrepreneurship", "independent contractor"], relatedSkillIds: ["s058", "s043", "s080"] },
  { id: "s274", name: "Digital Literacy", category: "life", aliases: ["computer basics", "internet skills", "online safety", "basic IT"], relatedSkillIds: ["s100", "s116", "s010"] },
  { id: "s275", name: "Report Writing", category: "life", aliases: ["formal reports", "briefing papers", "written summaries", "executive summaries"], relatedSkillIds: ["s001", "s054", "s022"] },
  { id: "s276", name: "Meeting Facilitation", category: "life", aliases: ["chairing meetings", "running meetings", "agenda management", "meeting minutes"], relatedSkillIds: ["s002", "s041", "s053"] },
  { id: "s277", name: "Complaint Handling", category: "life", aliases: ["complaint resolution", "grievance handling", "customer complaints"], relatedSkillIds: ["s057", "s007", "s050"] },
  { id: "s278", name: "Record Keeping", category: "life", aliases: ["filing", "document management", "data entry", "administrative records"], relatedSkillIds: ["s054", "s100", "s053"] },

  // === MORE FINANCIAL ===
  { id: "s280", name: "Credit Control", category: "financial", aliases: ["debt collection", "credit management", "accounts receivable", "cash collection"], relatedSkillIds: ["s080", "s004", "s054"] },
  { id: "s281", name: "Invoicing", category: "financial", aliases: ["billing", "accounts receivable processing", "invoice processing", "purchase order matching"], relatedSkillIds: ["s080", "s054", "s100"] },
  { id: "s282", name: "VAT Returns", category: "financial", aliases: ["VAT compliance", "VAT submissions", "MTD", "Making Tax Digital"], relatedSkillIds: ["s081", "s080", "s054"] },
  { id: "s283", name: "Management Reporting", category: "financial", aliases: ["management accounts", "monthly reporting", "board reporting", "financial reporting"], relatedSkillIds: ["s027", "s080", "s102"] },
  { id: "s284", name: "Mortgage Advisory", category: "financial", aliases: ["mortgage advice", "mortgage broking", "CeMAP", "lending criteria"], relatedSkillIds: ["s084", "s004", "s006"] },
  { id: "s285", name: "Insurance Underwriting", category: "financial", aliases: ["risk underwriting", "insurance assessment", "actuarial", "loss adjustment"], relatedSkillIds: ["s047", "s020", "s025"] },
  { id: "s286", name: "Credit Analysis", category: "financial", aliases: ["credit risk", "credit scoring", "creditworthiness", "lending analysis"], relatedSkillIds: ["s027", "s020", "s047"] },
  { id: "s287", name: "Treasury Management", category: "financial", aliases: ["cash management", "cash flow forecasting", "liquidity management", "foreign exchange"], relatedSkillIds: ["s027", "s084", "s043"] },
  { id: "s288", name: "Financial Regulation", category: "financial", aliases: ["FCA regulation", "PRA", "financial compliance", "conduct risk", "SMCR"], relatedSkillIds: ["s182", "s080", "s047"] },

  // === MORE EDUCATION ===
  { id: "s290", name: "Behaviour Management", category: "education", aliases: ["classroom behaviour", "positive behaviour", "de-escalation in schools", "behaviour policy"], relatedSkillIds: ["s160", "s007", "s050"] },
  { id: "s291", name: "Parent Engagement", category: "education", aliases: ["parent communication", "parent evenings", "home-school liaison", "parent partnership"], relatedSkillIds: ["s002", "s006", "s160"] },
  { id: "s292", name: "Exam Administration", category: "education", aliases: ["exam management", "invigilation", "exam officer", "JCQ regulations"], relatedSkillIds: ["s162", "s054", "s182"] },
  { id: "s293", name: "Pastoral Care", category: "education", aliases: ["student welfare", "personal development", "PSHE", "student support", "wellbeing"], relatedSkillIds: ["s163", "s050", "s174"] },
  { id: "s294", name: "School Business Management", category: "education", aliases: ["school finance", "school administration", "ISBL", "school operations"], relatedSkillIds: ["s043", "s049", "s080"] },
  { id: "s295", name: "Admissions", category: "education", aliases: ["student admissions", "university admissions", "school admissions", "enrolment"], relatedSkillIds: ["s006", "s054", "s278"] },
  { id: "s296", name: "Education Consultancy", category: "education", aliases: ["education advisory", "school improvement", "Ofsted preparation", "education policy"], relatedSkillIds: ["s160", "s042", "s022"] },
  { id: "s297", name: "SEND Coordination", category: "education", aliases: ["SENCo", "SEND code of practice", "EHC plans", "additional needs"], relatedSkillIds: ["s164", "s163", "s040"] },

  // === MORE LEGAL ===
  { id: "s300", name: "Case Management", category: "legal", aliases: ["legal case management", "caseload management", "case progression", "matter management"], relatedSkillIds: ["s040", "s180", "s054"] },
  { id: "s301", name: "Regulatory Knowledge", category: "legal", aliases: ["regulatory frameworks", "legislation interpretation", "regulatory landscape", "statutory requirements"], relatedSkillIds: ["s182", "s180", "s022"] },
  { id: "s302", name: "Due Diligence", category: "legal", aliases: ["legal due diligence", "commercial due diligence", "investigation", "background checks"], relatedSkillIds: ["s022", "s054", "s180"] },
  { id: "s303", name: "Conveyancing", category: "legal", aliases: ["property law", "property transactions", "land registry", "title deeds"], relatedSkillIds: ["s180", "s054", "s181"] },
  { id: "s304", name: "Legal Drafting", category: "legal", aliases: ["legal writing", "drafting agreements", "legal documentation", "pleadings"], relatedSkillIds: ["s001", "s180", "s181"] },
  { id: "s305", name: "Employment Law", category: "legal", aliases: ["HR law", "employment rights", "tribunal proceedings", "ACAS", "unfair dismissal"], relatedSkillIds: ["s180", "s182", "s007"] },
  { id: "s306", name: "Data Protection Law", category: "legal", aliases: ["GDPR", "data privacy", "information governance", "DPO", "privacy impact assessments"], relatedSkillIds: ["s109", "s182", "s180"] },
  { id: "s307", name: "Planning Law", category: "legal", aliases: ["town planning", "planning permission", "planning applications", "Section 106"], relatedSkillIds: ["s180", "s244", "s301"] },

  // === MORE COMMUNICATIONS / MEDIA ===
  { id: "s310", name: "Public Relations", category: "communication", aliases: ["PR", "media relations", "press releases", "press office", "reputation management"], relatedSkillIds: ["s001", "s009", "s154"] },
  { id: "s311", name: "Media Buying", category: "communication", aliases: ["media planning", "advertising buying", "ad placement", "programmatic"], relatedSkillIds: ["s111", "s043", "s020"] },
  { id: "s312", name: "Crisis Communications", category: "communication", aliases: ["crisis PR", "crisis response", "reputation crisis", "media handling"], relatedSkillIds: ["s310", "s201", "s001"] },
  { id: "s313", name: "Journalism", category: "communication", aliases: ["news writing", "reporting", "investigative journalism", "editorial"], relatedSkillIds: ["s001", "s022", "s009"] },
  { id: "s314", name: "Internal Communications", category: "communication", aliases: ["employee communications", "corporate communications", "staff engagement", "intranet content"], relatedSkillIds: ["s001", "s002", "s045"] },
  { id: "s315", name: "Speech Writing", category: "communication", aliases: ["speechcraft", "keynote writing", "address writing"], relatedSkillIds: ["s001", "s009", "s002"] },

  // === MORE SCIENTIFIC ===
  { id: "s320", name: "Data Governance", category: "scientific", aliases: ["data management", "data quality", "master data", "data cataloguing"], relatedSkillIds: ["s020", "s182", "s054"] },
  { id: "s321", name: "GIS", category: "scientific", aliases: ["geographic information systems", "mapping", "spatial analysis", "ArcGIS", "QGIS"], relatedSkillIds: ["s020", "s192", "s117"] },
  { id: "s322", name: "Biostatistics", category: "scientific", aliases: ["biomedical statistics", "clinical statistics", "epidemiology", "public health statistics"], relatedSkillIds: ["s023", "s234", "s022"] },

  // === GRANTS / CHARITY SPECIFIC ===
  { id: "s330", name: "Grant Writing", category: "communication", aliases: ["bid writing", "funding applications", "grant applications", "grant proposals"], relatedSkillIds: ["s001", "s022", "s043"] },
  { id: "s331", name: "Monitoring and Evaluation", category: "analytical", aliases: ["M&E", "impact measurement", "outcomes framework", "theory of change"], relatedSkillIds: ["s020", "s022", "s029"] },
  { id: "s332", name: "Programme Management", category: "management", aliases: ["charity programme management", "project portfolio", "multi-project management"], relatedSkillIds: ["s040", "s043", "s048"] },
  { id: "s333", name: "Community Development", category: "interpersonal", aliases: ["community work", "community engagement", "community empowerment", "social inclusion"], relatedSkillIds: ["s270", "s050", "s206"] },
  { id: "s334", name: "Safeguarding Adults", category: "healthcare", aliases: ["adult protection", "vulnerable adults safeguarding", "mental capacity"], relatedSkillIds: ["s163", "s050", "s182"] },

  // === PUBLIC SECTOR SPECIFIC ===
  { id: "s340", name: "Policy Development", category: "analytical", aliases: ["policy writing", "policy formulation", "public policy", "policy analysis"], relatedSkillIds: ["s022", "s001", "s042"] },
  { id: "s341", name: "Freedom of Information", category: "legal", aliases: ["FOI", "FOI requests", "information requests", "transparency"], relatedSkillIds: ["s182", "s278", "s001"] },
  { id: "s342", name: "Committee Servicing", category: "management", aliases: ["committee support", "governance support", "board servicing", "minute taking"], relatedSkillIds: ["s276", "s278", "s001"] },
  { id: "s343", name: "Democratic Services", category: "management", aliases: ["council governance", "local democracy", "elections", "member support"], relatedSkillIds: ["s342", "s182", "s001"] },

  // === RETAIL / HOSPITALITY SPECIFIC ===
  { id: "s350", name: "Visual Merchandising", category: "creative", aliases: ["store display", "window dressing", "product display", "retail design"], relatedSkillIds: ["s151", "s155", "s057"] },
  { id: "s351", name: "Retail Buying", category: "financial", aliases: ["buying", "range planning", "product selection", "merchandising", "retail merchandising"], relatedSkillIds: ["s085", "s004", "s020"] },
  { id: "s352", name: "Hospitality Management", category: "management", aliases: ["hotel management", "resort management", "accommodation management", "front of house management"], relatedSkillIds: ["s049", "s057", "s041"] },
  { id: "s353", name: "Food Safety", category: "healthcare", aliases: ["food hygiene", "HACCP", "food safety level 3", "allergen management"], relatedSkillIds: ["s135", "s173", "s182"] },
  { id: "s354", name: "Revenue Per Available Room", category: "financial", aliases: ["RevPAR", "hotel revenue management", "occupancy management", "room pricing"], relatedSkillIds: ["s266", "s020", "s352"] },
  { id: "s355", name: "Retail Operations", category: "management", aliases: ["store operations", "shop floor management", "retail management", "multi-site management"], relatedSkillIds: ["s049", "s041", "s265"] },

  // === TRANSPORT / AVIATION ===
  { id: "s360", name: "Aviation Safety", category: "healthcare", aliases: ["cabin safety", "emergency procedures aviation", "safety drills", "crew resource management"], relatedSkillIds: ["s173", "s201", "s208"] },
  { id: "s361", name: "Passenger Service", category: "interpersonal", aliases: ["in-flight service", "passenger care", "cabin crew service", "customer hospitality"], relatedSkillIds: ["s057", "s008", "s050"] },

  // === ADDITIONAL DIGITAL ===
  { id: "s370", name: "SEO", category: "technical", aliases: ["search engine optimisation", "organic search", "keyword research", "on-page SEO", "technical SEO"], relatedSkillIds: ["s111", "s020", "s106"] },
  { id: "s371", name: "Google Analytics", category: "technical", aliases: ["GA4", "web analytics", "Google Analytics 4", "analytics reporting"], relatedSkillIds: ["s020", "s111", "s102"] },
  { id: "s372", name: "Email Marketing", category: "technical", aliases: ["Mailchimp", "email campaigns", "marketing automation", "drip campaigns", "newsletter management"], relatedSkillIds: ["s111", "s150", "s001"] },
  { id: "s373", name: "PPC Advertising", category: "technical", aliases: ["Google Ads", "paid search", "pay-per-click", "Meta Ads", "display advertising"], relatedSkillIds: ["s111", "s020", "s043"] },
  { id: "s374", name: "Conversion Rate Optimisation", category: "technical", aliases: ["CRO", "A/B testing", "landing page optimisation", "funnel optimisation"], relatedSkillIds: ["s020", "s113", "s111"] },
];

// Helper: get skill by ID
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

// Helper: search skills by name or alias
export function searchSkills(query: string): Skill[] {
  const q = query.toLowerCase();
  return SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

// Helper: get all skill names for the Claude prompt (compact format)
export function getSkillNamesForPrompt(): string {
  return SKILLS.map((s) => `${s.id}:${s.name}`).join("|");
}
