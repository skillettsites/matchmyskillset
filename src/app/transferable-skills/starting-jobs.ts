// Jobs people commonly leave, with the skills that usually carry over and CV
// wording for each. Used by the /transferable-skills tool.
//
// WHAT IS SOURCED: `soc`, the ONS SOC 2020 unit group used for the pay figure
// (checked against ONS SOC 2020 Volume 1 titles in src/data/careers/soc2020.json).
// Pay itself comes from ONS ASHE 2025 by SOC code at build time.
//
// WHAT IS EDITORIAL JUDGEMENT (say so on the page, never present it as data):
// the display title, which skills are listed, their importance (1 to 5) and the
// CV lines. Skill ids map to src/data/skills-taxonomy.ts so they can be matched
// against the destination occupations in src/data/careers/occupations.ts.
// Square brackets in a CV line mark the details the reader fills in.

export interface StartingSkill {
  id: string;
  importance: 1 | 2 | 3 | 4 | 5;
  cv: string;
}

export interface StartingJob {
  key: string;
  title: string;
  group: "Education" | "Health and care" | "Police, forces and public service" | "Retail, hospitality and customer service" | "Office and finance" | "Logistics and driving";
  soc: string;
  skills: StartingSkill[];
}

export const STARTING_JOBS: StartingJob[] = [
  {
    key: "secondary-teacher",
    title: "Secondary school teacher",
    group: "Education",
    soc: "2313",
    skills: [
      { id: "s161", importance: 5, cv: "Planned and delivered [number] lessons a week to groups of up to [number], adapting material for different abilities." },
      { id: "s157", importance: 4, cv: "Wrote and updated schemes of work and resources for [subject] at [key stages]." },
      { id: "s162", importance: 4, cv: "Designed assessments and used the results to track progress and target support." },
      { id: "s002", importance: 4, cv: "Explained complex ideas clearly to mixed audiences every day, including parents and colleagues." },
      { id: "s020", importance: 3, cv: "Analysed attainment data for [number] students to spot gaps and plan interventions." },
      { id: "s048", importance: 3, cv: "Worked with parents, support staff and outside agencies to agree plans for individual students." },
      { id: "s163", importance: 3, cv: "Trained in safeguarding; identified and reported concerns in line with school procedures." },
      { id: "s053", importance: 3, cv: "Managed marking, planning and reporting deadlines alongside a full teaching timetable." },
    ],
  },
  {
    key: "primary-teacher",
    title: "Primary school teacher",
    group: "Education",
    soc: "2314",
    skills: [
      { id: "s161", importance: 5, cv: "Taught the full primary curriculum to a class of [number], adapting lessons for a wide range of needs." },
      { id: "s162", importance: 4, cv: "Assessed progress through the year and reported results to parents and school leaders." },
      { id: "s164", importance: 4, cv: "Put support plans in place for pupils with special educational needs, working with the SENCo." },
      { id: "s291", importance: 4, cv: "Built good working relationships with parents and carers, including through difficult conversations." },
      { id: "s157", importance: 3, cv: "Planned units of work and led [subject] across the school as subject lead." },
      { id: "s041", importance: 3, cv: "Directed the work of [number] teaching assistants and volunteers in the classroom." },
      { id: "s163", importance: 3, cv: "Trained in safeguarding; recorded and escalated concerns in line with school procedures." },
    ],
  },
  {
    key: "teaching-assistant",
    title: "Teaching assistant",
    group: "Education",
    soc: "6112",
    skills: [
      { id: "s164", importance: 5, cv: "Supported pupils with special educational needs one to one and in small groups." },
      { id: "s161", importance: 4, cv: "Led small-group interventions in reading and maths, following the class teacher's plans." },
      { id: "s204", importance: 4, cv: "Stayed calm and consistent with children who found school difficult." },
      { id: "s290", importance: 3, cv: "Helped manage behaviour and keep lessons on track." },
      { id: "s278", importance: 3, cv: "Kept accurate records of pupil progress and shared them with teachers." },
      { id: "s163", importance: 3, cv: "Trained in safeguarding and followed school procedures for reporting concerns." },
    ],
  },
  {
    key: "nurse",
    title: "Nurse",
    group: "Health and care",
    soc: "2237",
    skills: [
      { id: "s171", importance: 5, cv: "Assessed patients, recognised deterioration early and escalated to the medical team." },
      { id: "s201", importance: 4, cv: "Made quick, safe decisions under pressure on a busy [ward or unit]." },
      { id: "s278", importance: 4, cv: "Kept accurate, timely clinical records in line with NMC standards." },
      { id: "s050", importance: 4, cv: "Supported patients and families through difficult news and stressful situations." },
      { id: "s161", importance: 3, cv: "Mentored and assessed student nurses and trained new staff on [procedure or system]." },
      { id: "s237", importance: 3, cv: "Planned, delivered and reviewed care for up to [number] patients a shift." },
      { id: "s231", importance: 3, cv: "Took part in audits and incident reviews to improve patient safety." },
      { id: "s051", importance: 3, cv: "Worked across disciplines with doctors, therapists and social care to plan discharges." },
    ],
  },
  {
    key: "healthcare-assistant",
    title: "Healthcare assistant",
    group: "Health and care",
    soc: "6131",
    skills: [
      { id: "s170", importance: 5, cv: "Provided personal care and support to patients, respecting their dignity and choices." },
      { id: "s050", importance: 4, cv: "Reassured anxious patients and families and passed on concerns to the nursing team." },
      { id: "s278", importance: 4, cv: "Recorded observations, fluid charts and care notes accurately." },
      { id: "s232", importance: 3, cv: "Followed infection control procedures in a clinical setting." },
      { id: "s051", importance: 3, cv: "Worked as part of a ward team on day, night and weekend shifts." },
      { id: "s204", importance: 3, cv: "Stayed patient and calm with confused or distressed patients." },
    ],
  },
  {
    key: "care-worker",
    title: "Care worker",
    group: "Health and care",
    soc: "6135",
    skills: [
      { id: "s207", importance: 5, cv: "Supported [number] people a day to live independently at home, following their care plans." },
      { id: "s334", importance: 4, cv: "Recognised and reported safeguarding concerns about vulnerable adults." },
      { id: "s278", importance: 4, cv: "Kept clear daily care records and reported changes to the office or family." },
      { id: "s053", importance: 4, cv: "Managed a tight schedule of visits across [area] on time." },
      { id: "s050", importance: 4, cv: "Built trusting relationships with clients and their families." },
      { id: "s172", importance: 3, cv: "Prompted and recorded medication in line with training and policy." },
    ],
  },
  {
    key: "social-worker",
    title: "Social worker",
    group: "Health and care",
    soc: "2461",
    skills: [
      { id: "s300", importance: 5, cv: "Managed a caseload of [number] families, from assessment to review." },
      { id: "s163", importance: 5, cv: "Led safeguarding assessments and made decisions about risk to children or adults." },
      { id: "s275", importance: 4, cv: "Wrote assessments and court reports that stood up to scrutiny." },
      { id: "s048", importance: 4, cv: "Worked with health, education, police and housing to agree support plans." },
      { id: "s007", importance: 4, cv: "Handled conflict and difficult conversations with families calmly and fairly." },
      { id: "s276", importance: 3, cv: "Chaired and minuted multi-agency meetings." },
      { id: "s301", importance: 3, cv: "Applied legislation and statutory guidance in day-to-day decisions." },
    ],
  },
  {
    key: "police-officer",
    title: "Police officer",
    group: "Police, forces and public service",
    soc: "3312",
    skills: [
      { id: "s201", importance: 5, cv: "Took charge of incidents and made quick decisions in fast-changing situations." },
      { id: "s007", importance: 5, cv: "De-escalated conflict with members of the public, often in tense situations." },
      { id: "s275", importance: 4, cv: "Wrote evidential statements and case files to the standard needed for court." },
      { id: "s022", importance: 4, cv: "Investigated [type of] offences, gathering and assessing evidence from several sources." },
      { id: "s163", importance: 4, cv: "Identified risk to vulnerable people and made safeguarding referrals." },
      { id: "s002", importance: 3, cv: "Interviewed witnesses, victims and suspects, and gave evidence in court." },
      { id: "s047", importance: 3, cv: "Assessed risk to the public and colleagues before and during operations." },
      { id: "s182", importance: 3, cv: "Applied legislation, policy and procedure accurately in daily decisions." },
    ],
  },
  {
    key: "armed-forces",
    title: "Armed forces (soldier, sailor or RAF)",
    group: "Police, forces and public service",
    soc: "3311",
    skills: [
      { id: "s041", importance: 5, cv: "Led a team of [number], responsible for their training, welfare and performance." },
      { id: "s040", importance: 4, cv: "Planned and delivered [exercise or operation], coordinating people, equipment and timings." },
      { id: "s047", importance: 4, cv: "Carried out risk assessments and kept teams safe in demanding environments." },
      { id: "s161", importance: 4, cv: "Trained and assessed personnel in [skill], to a set standard." },
      { id: "s049", importance: 3, cv: "Managed logistics and equipment worth [value], keeping accurate records." },
      { id: "s201", importance: 3, cv: "Stayed calm and made sound decisions under pressure." },
      { id: "s173", importance: 3, cv: "Enforced health and safety procedures on [site, vehicle or equipment]." },
    ],
  },
  {
    key: "retail-assistant",
    title: "Retail or sales assistant",
    group: "Retail, hospitality and customer service",
    soc: "7111",
    skills: [
      { id: "s057", importance: 5, cv: "Served [number] customers a day, dealing with questions and problems on the spot." },
      { id: "s277", importance: 4, cv: "Handled complaints calmly and resolved most without escalating." },
      { id: "s005", importance: 3, cv: "Recommended products and met or beat personal sales targets." },
      { id: "s265", importance: 3, cv: "Took deliveries, rotated stock and completed stock counts accurately." },
      { id: "s051", importance: 3, cv: "Worked shifts as part of a team of [number], covering busy periods." },
      { id: "s054", importance: 3, cv: "Handled cash and card payments accurately and balanced the till." },
    ],
  },
  {
    key: "retail-manager",
    title: "Retail or store manager",
    group: "Retail, hospitality and customer service",
    soc: "1150",
    skills: [
      { id: "s041", importance: 5, cv: "Managed a team of [number], including rotas, training, absence and performance." },
      { id: "s355", importance: 5, cv: "Ran a store with sales of [value] a year, hitting [target] against budget." },
      { id: "s046", importance: 4, cv: "Recruited, inducted and trained new starters." },
      { id: "s043", importance: 4, cv: "Managed payroll hours and costs within a set budget." },
      { id: "s020", importance: 3, cv: "Used sales and stock reports to decide ranging, staffing and promotions." },
      { id: "s044", importance: 3, cv: "Ran one-to-ones and appraisals and dealt with conduct issues." },
      { id: "s173", importance: 3, cv: "Kept the store compliant with health and safety and security procedures." },
    ],
  },
  {
    key: "customer-service-adviser",
    title: "Customer service adviser",
    group: "Retail, hospitality and customer service",
    soc: "7219",
    skills: [
      { id: "s057", importance: 5, cv: "Handled [number] calls, chats or emails a day, resolving most at first contact." },
      { id: "s277", importance: 5, cv: "Dealt with complaints, calming frustrated customers and agreeing a fair outcome." },
      { id: "s003", importance: 4, cv: "Listened carefully to understand the real problem before offering a solution." },
      { id: "s110", importance: 3, cv: "Kept accurate records in [CRM system] for every contact." },
      { id: "s053", importance: 3, cv: "Met service targets for handling time and quality." },
      { id: "s024", importance: 3, cv: "Worked out fixes for account and order problems, escalating only when needed." },
    ],
  },
  {
    key: "chef",
    title: "Chef",
    group: "Retail, hospitality and customer service",
    soc: "5434",
    skills: [
      { id: "s353", importance: 5, cv: "Kept the kitchen compliant with food safety and allergen rules, including records for inspections." },
      { id: "s201", importance: 4, cv: "Delivered [number] covers a service under constant time pressure." },
      { id: "s041", importance: 3, cv: "Led a kitchen team of [number], training junior staff." },
      { id: "s265", importance: 3, cv: "Ordered stock, controlled waste and kept food costs to [target]." },
      { id: "s173", importance: 3, cv: "Followed and enforced health and safety procedures in a busy kitchen." },
      { id: "s051", importance: 3, cv: "Worked closely with front-of-house to keep service running smoothly." },
    ],
  },
  {
    key: "hospitality-manager",
    title: "Restaurant, pub or hotel manager",
    group: "Retail, hospitality and customer service",
    soc: "1222",
    skills: [
      { id: "s352", importance: 5, cv: "Ran a [venue] with turnover of [value], responsible for staff, stock and standards." },
      { id: "s041", importance: 5, cv: "Recruited, trained and scheduled a team of [number]." },
      { id: "s043", importance: 4, cv: "Controlled labour and stock costs against budget and reported weekly results." },
      { id: "s057", importance: 4, cv: "Handled customer feedback and complaints, protecting reviews and repeat trade." },
      { id: "s182", importance: 3, cv: "Kept the venue compliant with licensing, food safety and health and safety rules." },
      { id: "s156", importance: 3, cv: "Planned and ran events and functions for up to [number] guests." },
    ],
  },
  {
    key: "administrator",
    title: "Administrator or office assistant",
    group: "Office and finance",
    soc: "4159",
    skills: [
      { id: "s278", importance: 5, cv: "Maintained accurate records and filing systems for [team or department]." },
      { id: "s100", importance: 4, cv: "Produced documents, spreadsheets and reports in Microsoft Office." },
      { id: "s203", importance: 4, cv: "Organised diaries, meetings and travel for [number] colleagues." },
      { id: "s054", importance: 4, cv: "Checked data and paperwork carefully before it went out." },
      { id: "s057", importance: 3, cv: "Was the first point of contact for phone and email enquiries." },
      { id: "s306", importance: 2, cv: "Handled personal data in line with data protection rules." },
    ],
  },
  {
    key: "bookkeeper",
    title: "Bookkeeper or finance assistant",
    group: "Office and finance",
    soc: "4122",
    skills: [
      { id: "s080", importance: 5, cv: "Kept the books for [number] clients or cost centres, up to trial balance." },
      { id: "s054", importance: 5, cv: "Reconciled bank and ledger accounts and resolved discrepancies." },
      { id: "s281", importance: 4, cv: "Raised invoices and chased payment, reducing overdue debt." },
      { id: "s282", importance: 3, cv: "Prepared VAT returns for review." },
      { id: "s101", importance: 3, cv: "Built spreadsheets to track spending and produce monthly reports." },
      { id: "s278", importance: 3, cv: "Kept financial records audit-ready." },
    ],
  },
  {
    key: "warehouse-operative",
    title: "Warehouse operative",
    group: "Logistics and driving",
    soc: "9252",
    skills: [
      { id: "s265", importance: 4, cv: "Picked, packed and checked orders accurately against targets." },
      { id: "s173", importance: 4, cv: "Followed safe working procedures, including manual handling and equipment checks." },
      { id: "s054", importance: 3, cv: "Checked deliveries against paperwork and reported damage or shortages." },
      { id: "s051", importance: 3, cv: "Worked in a shift team to meet daily dispatch deadlines." },
      { id: "s053", importance: 3, cv: "Kept to pick rates and dispatch times during peak periods." },
    ],
  },
  {
    key: "hgv-driver",
    title: "HGV driver",
    group: "Logistics and driving",
    soc: "8211",
    skills: [
      { id: "s133", importance: 5, cv: "Drove [class] vehicles safely across [region], with a clean licence." },
      { id: "s053", importance: 4, cv: "Planned routes and delivery windows to meet tight schedules." },
      { id: "s173", importance: 4, cv: "Carried out vehicle checks and followed drivers' hours and load safety rules." },
      { id: "s054", importance: 4, cv: "Completed delivery paperwork and tachograph records accurately." },
      { id: "s057", importance: 3, cv: "Represented the company to customers at every drop." },
      { id: "s052", importance: 3, cv: "Adapted to changes in routes, weather and delivery plans at short notice." },
    ],
  },
];
