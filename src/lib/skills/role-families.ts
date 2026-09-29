// Occupation families: broad kinds of work ("Accounting and finance", "IT and
// software", "Nursing"). Used by the job matcher to tell whether a live advert
// is in the person's own line of work ("Stay in my field"), in the line of
// work of one of their career matches, or something unrelated that should not
// be shown at all. No data imports, so it is safe anywhere.
//
// WHAT IS EDITORIAL JUDGEMENT (never present it as data): every family, which
// family each curated occupation and starting job belongs to, the title
// keywords for each family and the false-friend list. ONS SOC 2020 minor groups
// were the starting point, but they split some kinds of work we treat as one
// (accounts assistant 4122, accounting technician 3533 and accountant 2421 are
// three minor groups but one line of work) and join some we keep apart.

export type RoleFamily =
  | "finance"
  | "financial-services"
  | "it"
  | "data"
  | "projects"
  | "risk-compliance"
  | "public-admin"
  | "procurement-logistics"
  | "office-admin"
  | "customer-service"
  | "facilities"
  | "hr"
  | "learning"
  | "teaching"
  | "childcare"
  | "social-care"
  | "care"
  | "therapy"
  | "allied-health"
  | "nursing"
  | "dental"
  | "animal-care"
  | "science"
  | "clinical-research"
  | "health-admin"
  | "policing"
  | "investigation"
  | "security"
  | "legal"
  | "sales"
  | "retail"
  | "marketing"
  | "writing"
  | "building-trades"
  | "construction"
  | "engineering"
  | "transport"
  | "hospitality"
  | "armed-forces"
  | "personal-services";

export const FAMILY_LABELS: Record<RoleFamily, string> = {
  finance: "Accounting and finance",
  "financial-services": "Banking and financial advice",
  it: "IT and software",
  data: "Data and research",
  projects: "Projects and business change",
  "risk-compliance": "Risk, compliance and safety",
  "public-admin": "Government and public administration",
  "procurement-logistics": "Buying, supply chain and logistics",
  "office-admin": "Office and administration",
  "customer-service": "Customer service",
  facilities: "Facilities management",
  hr: "HR and recruitment",
  learning: "Training and development",
  teaching: "Teaching and education",
  childcare: "Childcare and early years",
  "social-care": "Social work and support",
  care: "Care work",
  therapy: "Counselling and therapy",
  "allied-health": "Allied health",
  nursing: "Nursing",
  dental: "Dental",
  "animal-care": "Animal care",
  science: "Science and laboratories",
  "clinical-research": "Clinical research",
  "health-admin": "Healthcare management and admin",
  policing: "Policing, justice and emergency services",
  investigation: "Investigation and enforcement",
  security: "Security",
  legal: "Legal",
  sales: "Sales and account management",
  retail: "Retail",
  marketing: "Marketing and communications",
  writing: "Writing and editing",
  "building-trades": "Building trades",
  construction: "Construction management",
  engineering: "Engineering, manufacturing and maintenance",
  transport: "Driving and transport",
  hospitality: "Hospitality",
  "armed-forces": "Armed forces",
  "personal-services": "Hair and beauty",
};

/** Family of each curated occupation (src/data/careers/occupations.ts), by id. */
const OCCUPATION_FAMILY: Record<string, RoleFamily> = {
  "data-analyst": "data",
  "data-scientist": "data",
  "software-developer": "it",
  "web-developer": "it",
  "ux-designer": "it",
  "user-researcher": "data",
  "cyber-security-analyst": "it",
  "it-support-technician": "it",
  "network-engineer": "it",
  "software-tester": "it",
  "business-analyst": "projects",
  "it-project-manager": "it",
  "e-learning-developer": "learning",
  "project-manager": "projects",
  "project-support-officer": "projects",
  "management-consultant": "projects",
  "risk-analyst": "risk-compliance",
  "risk-manager": "risk-compliance",
  "compliance-officer": "risk-compliance",
  "policy-officer": "public-admin",
  "civil-service-executive-officer": "public-admin",
  "work-coach": "public-admin",
  "purchasing-manager": "procurement-logistics",
  "procurement-officer": "procurement-logistics",
  "office-manager": "office-admin",
  "events-manager": "marketing",
  "customer-service-manager": "customer-service",
  "logistics-manager": "procurement-logistics",
  "transport-manager": "procurement-logistics",
  "warehouse-manager": "procurement-logistics",
  "facilities-manager": "facilities",
  "health-and-safety-adviser": "risk-compliance",
  "hr-officer": "hr",
  "hr-manager": "hr",
  "recruitment-consultant": "hr",
  "learning-and-development-adviser": "learning",
  "learning-and-development-manager": "learning",
  "training-assessor": "learning",
  "it-trainer": "learning",
  "careers-adviser": "learning",
  "education-adviser": "teaching",
  "ofsted-inspector": "teaching",
  "school-business-manager": "office-admin",
  "private-tutor": "teaching",
  "further-education-lecturer": "teaching",
  "efl-teacher": "teaching",
  "educational-psychologist": "therapy",
  "teaching-assistant": "teaching",
  "secondary-school-teacher": "teaching",
  "youth-worker": "social-care",
  counsellor: "therapy",
  psychotherapist: "therapy",
  "cbt-therapist": "therapy",
  "social-worker": "social-care",
  "probation-officer": "social-care",
  "probation-services-officer": "social-care",
  "safeguarding-officer": "social-care",
  "family-support-worker": "social-care",
  "housing-officer": "social-care",
  "victim-care-officer": "social-care",
  "youth-offending-team-officer": "social-care",
  "debt-adviser": "social-care",
  "police-officer": "policing",
  pcso: "policing",
  "fraud-investigator": "investigation",
  "intelligence-analyst": "investigation",
  "private-investigator": "investigation",
  "security-manager": "security",
  "security-officer": "security",
  "close-protection-officer": "security",
  "crime-scene-investigator": "investigation",
  "border-force-officer": "policing",
  "prison-officer": "policing",
  firefighter: "policing",
  "trading-standards-officer": "investigation",
  "emergency-planning-officer": "policing",
  nurse: "nursing",
  "nursing-associate": "nursing",
  "healthcare-assistant": "care",
  paramedic: "allied-health",
  "occupational-therapist": "allied-health",
  "clinical-coder": "health-admin",
  "nurse-educator": "nursing",
  "nurse-lecturer": "teaching",
  "medical-sales-representative": "sales",
  "healthcare-commissioning-manager": "health-admin",
  "occupational-health-nurse-adviser": "nursing",
  "clinical-research-associate": "clinical-research",
  "clinical-trials-coordinator": "clinical-research",
  "health-service-manager": "health-admin",
  "gp-practice-manager": "health-admin",
  "pals-officer": "health-admin",
  "data-protection-officer": "risk-compliance",
  accountant: "finance",
  "accounting-technician": "finance",
  bookkeeper: "finance",
  "financial-adviser": "financial-services",
  "mortgage-adviser": "financial-services",
  "tax-adviser": "finance",
  paralegal: "legal",
  "legal-executive": "legal",
  solicitor: "legal",
  "sales-representative": "sales",
  "business-development-manager": "sales",
  "marketing-executive": "marketing",
  "marketing-manager": "marketing",
  "pr-officer": "marketing",
  "social-media-manager": "marketing",
  copywriter: "marketing",
  fundraiser: "marketing",
  "estate-agent": "sales",
  "technical-author": "writing",
  electrician: "building-trades",
  plumber: "building-trades",
  carpenter: "building-trades",
  bricklayer: "building-trades",
  plasterer: "building-trades",
  "construction-site-supervisor": "construction",
  "construction-manager": "construction",
  "quantity-surveyor": "construction",
  "air-conditioning-engineer": "building-trades",
  "vehicle-technician": "engineering",
  "maintenance-fitter": "engineering",
  "engineering-technician": "engineering",
  "wind-turbine-technician": "engineering",
  "aircraft-maintenance-engineer": "engineering",
  "telecoms-engineer": "engineering",
  scaffolder: "building-trades",
  "crane-driver": "transport",
  welder: "engineering",
  "cad-technician": "engineering",
  // Engineering, manufacturing and Industry 4.0 (added 29 September 2026). One family on
  // purpose: a maintenance technician, a CNC setter and an automation engineer are the same
  // line of work for "Stay in my field", and the match score separates them by skills.
  "robotics-engineer": "engineering",
  "mechatronics-engineer": "engineering",
  "additive-manufacturing-engineer": "engineering",
  "automation-engineer": "engineering",
  "manufacturing-engineer": "engineering",
  "mechanical-engineer": "engineering",
  "electrical-engineer": "engineering",
  "electronics-engineer": "engineering",
  "electrical-electronics-technician": "engineering",
  "automation-technician": "engineering",
  "cnc-machinist": "engineering",
  "3d-printing-technician": "engineering",
  "quality-engineer": "engineering",
  "field-service-engineer": "engineering",
  "embedded-software-engineer": "engineering",
  "production-manager": "engineering",
  "project-engineer": "engineering",
  "technical-sales-engineer": "sales",
  "hgv-driver": "transport",
  "bus-driver": "transport",
  "train-driver": "transport",
  "railway-signaller": "transport",
  "rail-track-maintenance-worker": "transport",
  "train-conductor": "transport",
  "air-traffic-controller": "transport",
  "driving-instructor": "transport",
  "local-government-officer": "public-admin",
  "town-planner": "public-admin",
};

/** Family of each starting job (src/lib/skills/starting-jobs.ts), by key. */
const STARTING_JOB_FAMILY: Record<string, RoleFamily> = {
  "retail-manager": "retail",
  "retail-supervisor": "retail",
  "sales-assistant": "retail",
  "customer-service-adviser": "customer-service",
  "call-centre-agent": "customer-service",
  "customer-service-team-leader": "customer-service",
  "primary-school-teacher": "teaching",
  "early-years-practitioner": "childcare",
  chef: "hospitality",
  "restaurant-manager": "hospitality",
  "hotel-manager": "hospitality",
  waiter: "hospitality",
  receptionist: "office-admin",
  administrator: "office-admin",
  "personal-assistant": "office-admin",
  "bank-clerk": "financial-services",
  "care-worker": "care",
  "senior-care-worker": "care",
  "dental-nurse": "dental",
  "armed-forces-other-ranks": "armed-forces",
  "armed-forces-officer": "armed-forces",
  "warehouse-operative": "procurement-logistics",
  "delivery-driver": "transport",
  hairdresser: "personal-services",
  "cabin-crew": "hospitality",
};

/** Family of a job index key ("occ:<occupation id>" or "job:<starting job key>"), if we have one. */
export function familyOfJobKey(key: string | null | undefined): RoleFamily | null {
  if (!key) return null;
  if (key.startsWith("occ:")) return OCCUPATION_FAMILY[key.slice(4)] ?? null;
  if (key.startsWith("job:")) return STARTING_JOB_FAMILY[key.slice(4)] ?? null;
  return null;
}

export function familyOfOccupation(id: string | null | undefined): RoleFamily | null {
  return id ? (OCCUPATION_FAMILY[id] ?? null) : null;
}

/**
 * Advert titles that look like one job but are another. Checked before
 * anything else: "Nursery Nurse" is childcare, not nursing; "Account Manager"
 * is sales, not accounts.
 */
export const FALSE_FRIENDS: readonly { re: RegExp; family: RoleFamily }[] = [
  { re: /\bnursery nurses?\b/i, family: "childcare" },
  { re: /\b(veterinary|vet|animal) nurses?\b/i, family: "animal-care" },
  { re: /\bdental nurses?\b/i, family: "dental" },
  { re: /\bhealthcare support workers?\b/i, family: "care" },
  { re: /\baccount (managers?|executives?|directors?|handlers?|leads?|co-?ordinators?|specialists?|representatives?|reps?|developers?|partners?)\b/i, family: "sales" },
  { re: /\baccount and [a-z]+ managers?\b/i, family: "sales" },
  { re: /\baccounts? (payable|receivable)\b/i, family: "finance" },
  { re: /\b(sales|purchase) ledger\b/i, family: "finance" },
  { re: /\bcredit control(ler)?s?\b/i, family: "finance" },
  { re: /\bsecurity (guards?|officers?)\b/i, family: "security" },
  { re: /\b(cyber|information|it|network|cloud) security\b/i, family: "it" },
  { re: /\b(cnc|plc|robot|robotics|machine|machinery) programmers?\b/i, family: "engineering" },
  // Software testing, business process automation and marketing automation are not factory automation.
  { re: /\b(test|qa|software) automation\b|\bautomation (testers?|testing|test engineers?|qa)\b/i, family: "it" },
  { re: /\b(robotic process automation|rpa|business process automation|intelligent automation)\b/i, family: "it" },
  { re: /\bmarketing automation\b/i, family: "marketing" },
  { re: /\b(software|it|web|app|mobile|game|games) (quality assurance|quality|qa) (engineers?|analysts?|testers?)\b/i, family: "it" },
  { re: /\b(ux|ui|software|web) design engineers?\b/i, family: "it" },
  { re: /\b(it|ict|network|cloud|infrastructure|software|data cent(er|re)) (project|field) (engineers?|technicians?)\b|\b(it|ict|desktop) field (engineers?|technicians?)\b/i, family: "it" },
  // Security systems (access control, alarms, CCTV) are installed by building trades, not automation engineers.
  { re: /\b(access control|security systems?|intruder alarms?|fire alarms?|alarm|cctv) (systems? )?(engineers?|technicians?|installers?|fitters?)\b/i, family: "building-trades" },
  // Engineering titles that carry a software, IT, risk or sales word.
  { re: /\b(embedded|firmware|fpga) (software |systems? |c |hardware )?(engineers?|developers?|designers?|programmers?|specialists?|leads?)\b/i, family: "engineering" },
  { re: /\b(iot|iiot|internet of things) (engineers?|developers?|specialists?|technicians?|architects?)\b/i, family: "engineering" },
  { re: /\brobotics (software )?(engineers?|developers?|technicians?|specialists?)\b/i, family: "engineering" },
  { re: /\b(electronics?|electrical|mechanical|hardware|product|production|manufacturing|environmental|emc|rf|avionics) test (engineers?|technicians?)\b|\btest technicians?\b/i, family: "engineering" },
  { re: /\bquality (assurance |control )?(engineers?|inspectors?|technicians?)\b/i, family: "engineering" },
  { re: /\b(additive manufacturing|3d print\w*|3-d print\w*|machine vision|mechatronics?|scada)\b|\bplc (engineers?|technicians?|specialists?|developers?)\b/i, family: "engineering" },
  { re: /\b(science|lab|laboratory) technicians?\b/i, family: "science" },
  { re: /\b(art|design (and|&) technology|d ?& ?t|dt|food|textiles|drama|music|pe|computing|school|reprographics|stage|theatre) technicians?\b/i, family: "teaching" },
  { re: /\b(auto ?cad|cad|bim|revit) (technicians?|designers?|technologists?|draughts\w*)\b/i, family: "engineering" },
  { re: /\bpharmacy (technicians?|assistants?|dispensers?)\b/i, family: "allied-health" },
  { re: /\bnursery (managers?|practitioners?|assistants?|workers?|room leaders?)\b/i, family: "childcare" },
  { re: /\b(care home|registered|home care|domiciliary care) managers?\b/i, family: "care" },
  { re: /\bretail (banking|bank)\b/i, family: "financial-services" },
  { re: /\bservice desk\b|\bhelp ?desk\b|\bdesktop support\b|\b(1st|2nd|3rd|first|second|third) line\b/i, family: "it" },
];

/**
 * Title keywords per family, checked in this order (more specific first):
 * the first family whose pattern matches the advert title wins.
 */
export const FAMILY_KEYWORDS: readonly { family: RoleFamily; re: RegExp }[] = [
  { family: "personal-services", re: /\b(hairdresser|barber|beautician|beauty therapist|nail technician|salon|stylist)s?\b/i },
  { family: "dental", re: /\b(dental|dentist|orthodontic\w*|hygienist)s?\b/i },
  { family: "animal-care", re: /\b(veterinary|vet|animal|kennel|dog groomer|groomer|zookeeper)s?\b/i },
  { family: "childcare", re: /\b(nursery|early years|childcare|child care|nanny|nannies|pre-?school|childminder)s?\b/i },
  { family: "clinical-research", re: /\b(clinical research|clinical trials?|study coordinator)s?\b/i },
  { family: "allied-health", re: /\b(physiotherapist|physio|occupational therapist|speech and language|radiographer|paramedic|dietitian|podiatrist|sonographer|pharmacist|pharmacy|optometrist|audiologist|orthoptist|ambulance)s?\b/i },
  { family: "nursing", re: /\b(nurse|nurses|nursing|rgn|rmn|rnld|staff nurse|ward sister|matron|midwife|midwives|midwifery|health visitor)s?\b/i },
  { family: "care", re: /\b(care assistant|carer|care worker|senior carer|domiciliary|home care|care home|healthcare assistant|health care assistant|hca|personal care|care coordinator|care co-ordinator|care team leader)s?\b/i },
  { family: "therapy", re: /\b(counsellor|counselor|psychotherapist|therapist|cbt|psychologist|psychological wellbeing|talking therapies|iapt)s?\b/i },
  { family: "health-admin", re: /\b(clinical coder|clinical coding|pals|patient experience|practice manager|gp practice|nhs manager|ward clerk|medical secretary|medical receptionist|patient services)s?\b/i },
  { family: "finance", re: /\b(accountants?|accounting|accounts|bookkeep\w*|book-?keepers?|payroll|ledger|auditors?|audit|tax|vat|finance|financial controller|financial accountant|financial analyst|treasury|billing|fp&a|credit controllers?|management accounts)\b/i },
  { family: "financial-services", re: /\b(financial advis[eo]rs?|financial planners?|mortgage|wealth|investment advis[eo]rs?|bank|banking|building society|underwriters?|insurance|pensions?)\b/i },
  { family: "it", re: /\b(it (support|technicians?|engineers?|analysts?|managers?|officers?|administrators?|trainers?|apprentices?|helpdesk|operations|systems|infrastructure|security|project)|ict|infrastructure|sysadmin|systems? administrators?|devops|cloud|azure|aws|networks?|network engineers?|software|developers?|programmers?|cyber|infosec|technical support|servicenow|microsoft 365|m365|intune|data cent(er|re)|web developer|front-?end|back-?end|full-?stack|qa tester|test analyst|ux|ui designer|servers?|server engineers?|platform engineers?|devsecops|sre|site reliability|systems engineers?|end user|desktop|qa engineers?|test engineers?|3rd line|2nd line|1st line)\b/i },
  { family: "data", re: /\b(data analysts?|data scientists?|data engineers?|insight analysts?|bi analysts?|business intelligence|analytics|statisticians?|reporting analysts?|user researchers?|ux researchers?|research analysts?)\b/i },
  { family: "projects", re: /\b(project managers?|project co-?ordinators?|project support|pmo|programme managers?|business analysts?|change managers?|transformation)\b/i },
  { family: "risk-compliance", re: /\b(risk|compliance|health and safety|health & safety|h&s|she advis[eo]r|hse|data protection|information governance|quality assurance|qhse|aml|kyc|anti-money laundering)\b/i },
  { family: "investigation", re: /\b(investigators?|investigations?|fraud|intelligence analysts?|intelligence officers?|crime scene|trading standards|counter fraud)\b/i },
  { family: "policing", re: /\b(police|pcso|constables?|detectives?|prison|custody officers?|firefighters?|fire fighters?|border force|immigration officers?|emergency planning|resilience officers?)\b/i },
  { family: "security", re: /\b(security officers?|security guards?|door supervisors?|close protection|cctv|security managers?|site security|bodyguards?|store detectives?)\b/i },
  { family: "legal", re: /\b(solicitors?|paralegals?|legal|lawyers?|conveyanc\w*|barristers?|litigation|legal executives?)\b/i },
  { family: "hr", re: /\b(hr|human resources|people advis[eo]rs?|people partners?|recruit\w*|talent acquisition|resourcers?|people officers?)\b/i },
  { family: "learning", re: /\b(trainers?|training|learning and development|learning & development|l&d|assessors?|skills coach(es)?|careers advis[eo]rs?|instructional designers?|e-?learning)\b/i },
  { family: "teaching", re: /\b(teachers?|teaching|lecturers?|tutors?|head of (department|year)|senco|headteachers?|head teachers?|school|education|exams? officers?|examinations officers?|cover supervisors?|learning support)\b/i },
  { family: "social-care", re: /\b(social workers?|support workers?|family support|youth workers?|safeguarding|probation|housing officers?|housing|tenancy|key ?workers?|outreach|advocates?|advocacy|welfare|debt advis[eo]rs?|money advis[eo]rs?|victim)\b/i },
  { family: "procurement-logistics", re: /\b(procurement|buyers?|purchasing|supply chain|logistics|warehouse|distribution|transport managers?|fleet|inventory|stock controllers?|storem[ae]n|stores person|shipping|freight|import|export)\b/i },
  { family: "customer-service", re: /\b(customer services?|customer support|customer experience|contact centre|call centre|call center|customer care|customer advis[eo]rs?|customer success|complaints)\b/i },
  { family: "retail", re: /\b(store managers?|shop managers?|retail|sales assistants?|sales advis[eo]rs?|shop assistants?|store assistants?|customer assistants?|checkout|cashiers?|visual merchandis\w*|merchandisers?|store supervisors?|shop floor|store|stores|shop)\b/i },
  { family: "sales", re: /\b(sales|business development|bdm|bde|key accounts?|telesales|estate agents?|lettings|negotiators?|new business|partnerships managers?|territory managers?)\b/i },
  { family: "marketing", re: /\b(marketing|marketers?|seo|ppc|social media|content|copywriters?|communications|comms|pr|public relations|brand|campaigns?|press officers?|media|fundrais\w*|events?)\b/i },
  { family: "writing", re: /\b(technical authors?|technical writers?|writers?|editors?|proofreaders?|journalists?|reporters?)\b/i },
  { family: "facilities", re: /\b(facilities|estates managers?|building managers?|property managers?|caretakers?|maintenance managers?)\b/i },
  { family: "public-admin", re: /\b(civil servants?|civil service|executive officers?|council|local government|local authority|policy|work coach(es)?|jobcentre|planning officers?|town planners?|government)\b/i },
  { family: "building-trades", re: /\b(electricians?|plumbers?|carpenters?|joiners?|bricklayers?|plasterers?|scaffolders?|roofers?|painters?|decorators?|tilers?|gas engineers?|heating engineers?|hvac|air conditioning|refrigeration|multi-?trade\w*|handym[ae]n|labourers?|groundworkers?)\b/i },
  { family: "construction", re: /\b(site managers?|site supervisors?|construction|quantity surveyors?|surveyors?|contracts managers?|estimators?|building control)\b/i },
  {
    family: "engineering",
    re: /\b(mechanical|electrical engineers?|electrical (technicians?|fitters?|maintenance|design)|electronics?|electro-?mechanical|maintenance engineers?|maintenance technicians?|maintenance fitters?|maintenance planners?|fitters?|welders?|welding|fabricators?|fabrication|cnc|machinists?|machining|(machine|tool|press|mould|cnc) setters?|setter[- ]operators?|toolmakers?|machine operators?|press operators?|injection mould\w*|mechanics?|vehicle technicians?|motor|auto ?cad|cad|draughts\w*|bim|aircraft|avionics|wind turbine|engineering technicians?|manufacturing|production (engineers?|managers?|supervisors?|team leaders?|operatives?|operators?|technicians?|planners?)|assembly (operatives?|technicians?|workers?|engineers?)|assemblers?|process engineers?|industrial engineers?|design engineers?|project engineers?|applications engineers?|reliability engineers?|continuous improvement|lean|metrolog\w*|cmm|ndt|composites?|robots?|robotics|automation|(?<!(?:pest|stock|access|document|credit|traffic|infection|cost|budget|damp|weed|vermin|fire|flood|noise|border) )controls? (and instrumentation |systems? )?(engineers?|technicians?|specialists?|designers?)|instrumentation|c&i|e&i|commissioning (engineers?|technicians?)|iot|field service|field engineers?|service engineers?|telecoms|telecommunications|broadband|fibre|installers?|multi-?skilled|engineering)\b/i,
  },
  { family: "transport", re: /\b(drivers?|hgv|lgv|class [12]|couriers?|delivery drivers?|multi-?drop|chauffeurs?|train|trains|railway|rail|signallers?|conductors?|bus|coach drivers?|crane|forklift|flt|air traffic|driving instructors?|pilots?|dispatchers?|transport)\b/i },
  { family: "hospitality", re: /\b(chefs?|cooks?|kitchen|restaurant|waiters?|waitress(es)?|waiting staff|bar|bartenders?|baristas?|hotel|housekeep\w*|front of house|food and beverage|catering|hospitality|cabin crew|flight attendants?|kitchen porters?|pub)\b/i },
  { family: "armed-forces", re: /\b(army|soldiers?|royal navy|raf|armed forces|reservists?)\b/i },
  { family: "science", re: /\b(scientists?|chemists?|biologists?|microbiolog\w*|laborator(y|ies)|lab)\b/i },
  { family: "office-admin", re: /\b(administrators?|admin|administrative|administration|office managers?|office assistants?|receptionists?|secretar(y|ies)|personal assistants?|pa|executive assistants?|data entry|clerks?|clerical|office co-?ordinators?|business support|team secretar(y|ies))\b/i },
];

/** The first false friend that matches the title, if any. */
export function falseFriendFamily(title: string): RoleFamily | null {
  for (const f of FALSE_FRIENDS) if (f.re.test(title)) return f.family;
  return null;
}

/** The family the title's keywords point to, if any. */
export function keywordFamily(title: string): RoleFamily | null {
  for (const k of FAMILY_KEYWORDS) if (k.re.test(title)) return k.family;
  return null;
}
