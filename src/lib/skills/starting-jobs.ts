// Common jobs people leave that are not destinations in the curated list
// (src/data/careers/occupations.ts). They let "Start from your job" work for
// retail, hospitality, care, admin, customer service and armed forces roles.
//
// WHAT IS SOURCED: `soc`. Each code was checked on 28 September 2026 against
// ONS SOC 2020 Volume 1 related job titles and the Volume 2 coding index
// (src/data/careers/soc2020.json); `socTitles` lists the ONS titles that place
// the job in that unit group. Pay is never stored here: it comes from ASHE by
// SOC code, like everything else.
//
// WHAT IS EDITORIAL JUDGEMENT (never present it as data): the display title,
// aliases, and the skills with their importance (1 = useful, 5 = essential),
// mapped to ids in src/data/skills-taxonomy.ts. They describe what the job
// usually involves so the matcher has something to work with when a person
// types a job title instead of pasting a CV.

import type { Importance } from "@/data/careers";

export interface StartingJob {
  key: string;
  title: string;
  soc: string;
  socTitles: string[];
  aliases: string[];
  skills: readonly (readonly [string, Importance])[];
}

export const STARTING_JOBS: StartingJob[] = [
  // Retail
  {
    key: "retail-manager",
    title: "Retail manager",
    soc: "1150",
    socTitles: ["Retail manager"],
    aliases: ["Store manager", "Shop manager", "Assistant store manager", "Deputy store manager", "Branch manager (retail)"],
    skills: [["s355", 5], ["s041", 5], ["s044", 4], ["s043", 4], ["s057", 4], ["s265", 4], ["s203", 3], ["s046", 3], ["s007", 3], ["s020", 2]],
  },
  {
    key: "retail-supervisor",
    title: "Retail supervisor",
    soc: "7132",
    socTitles: ["Team leader (retail trade)", "Supervisor (retail, wholesale trade)", "Section manager (retail trade)"],
    aliases: ["Retail team leader", "Shop supervisor", "Section manager", "Duty manager (retail)"],
    skills: [["s057", 5], ["s355", 4], ["s041", 4], ["s203", 3], ["s265", 3], ["s007", 3], ["s053", 3], ["s161", 2]],
  },
  {
    key: "sales-assistant",
    title: "Sales assistant",
    soc: "7111",
    socTitles: ["Sales assistant", "Retail assistant", "Shop assistant"],
    aliases: ["Retail assistant", "Shop assistant", "Customer assistant", "Sales adviser (retail)"],
    skills: [["s057", 5], ["s002", 4], ["s051", 4], ["s053", 3], ["s005", 3], ["s277", 3], ["s054", 2]],
  },
  // Customer service
  {
    key: "customer-service-adviser",
    title: "Customer service adviser",
    soc: "7219",
    socTitles: ["Customer service adviser", "Customer adviser", "Customer services representative"],
    aliases: ["Customer adviser", "Customer services representative", "Complaints handler", "Customer service assistant"],
    skills: [["s057", 5], ["s277", 5], ["s003", 4], ["s002", 4], ["s110", 3], ["s007", 3], ["s054", 3], ["s274", 3]],
  },
  {
    key: "call-centre-agent",
    title: "Call centre agent",
    soc: "7211",
    socTitles: ["Call centre agent", "Call centre operator", "Customer service adviser (call centre)"],
    aliases: ["Call centre operator", "Contact centre adviser", "Call handler"],
    skills: [["s057", 5], ["s003", 5], ["s277", 4], ["s002", 4], ["s110", 3], ["s053", 3], ["s007", 3]],
  },
  {
    key: "customer-service-team-leader",
    title: "Customer service team leader",
    soc: "7220",
    socTitles: ["Team leader (call centre)", "Call centre supervisor", "Customer service supervisor"],
    aliases: ["Call centre team leader", "Call centre supervisor", "Customer service supervisor", "Contact centre team leader"],
    skills: [["s041", 5], ["s044", 4], ["s057", 4], ["s277", 4], ["s020", 3], ["s161", 3], ["s203", 3], ["s007", 3]],
  },
  // Education and childcare
  {
    key: "primary-school-teacher",
    title: "Primary school teacher",
    soc: "2314",
    socTitles: ["Primary school teacher", "Infant teacher", "Junior school teacher"],
    aliases: ["Primary teacher", "Infant teacher", "Junior school teacher", "Deputy head (primary)"],
    skills: [["s160", 5], ["s157", 4], ["s290", 4], ["s162", 4], ["s163", 4], ["s002", 4], ["s291", 3], ["s164", 3], ["s053", 3], ["s050", 3]],
  },
  {
    key: "early-years-practitioner",
    title: "Early years practitioner",
    soc: "3232",
    socTitles: ["Early years practitioner", "Childcare practitioner", "Pre-school practitioner"],
    aliases: ["Nursery practitioner", "Nursery nurse", "Childcare practitioner", "Pre-school practitioner", "Nursery worker"],
    skills: [["s163", 5], ["s207", 4], ["s291", 4], ["s050", 4], ["s204", 4], ["s160", 3], ["s278", 3], ["s208", 3]],
  },
  // Hospitality
  {
    key: "chef",
    title: "Chef",
    soc: "5434",
    socTitles: ["Chef", "Head chef", "Pastry chef"],
    aliases: ["Head chef", "Sous chef", "Chef de partie", "Commis chef", "Cook"],
    skills: [["s135", 5], ["s353", 5], ["s053", 4], ["s051", 4], ["s054", 4], ["s265", 3], ["s041", 3], ["s173", 3]],
  },
  {
    key: "restaurant-manager",
    title: "Restaurant manager",
    soc: "1222",
    socTitles: ["Restaurant manager", "Operations manager (catering)"],
    aliases: ["Cafe manager", "Catering manager", "General manager (restaurant)", "Hospitality manager"],
    skills: [["s041", 5], ["s057", 5], ["s352", 4], ["s043", 4], ["s353", 4], ["s203", 4], ["s046", 3], ["s265", 3], ["s007", 3]],
  },
  {
    key: "hotel-manager",
    title: "Hotel manager",
    soc: "1221",
    socTitles: ["Hotel manager"],
    aliases: ["Hotel general manager", "Guest services manager", "Front of house manager (hotel)"],
    skills: [["s352", 5], ["s041", 5], ["s057", 5], ["s043", 4], ["s266", 3], ["s046", 3], ["s007", 3], ["s354", 2]],
  },
  {
    key: "waiter",
    title: "Waiter or waitress",
    soc: "9264",
    socTitles: ["Waiter", "Waitress", "Food and beverage assistant"],
    aliases: ["Waiter", "Waitress", "Waiting staff", "Food and beverage assistant"],
    skills: [["s057", 5], ["s053", 4], ["s051", 4], ["s200", 4], ["s002", 3], ["s135", 2]],
  },
  // Office and administration
  {
    key: "receptionist",
    title: "Receptionist",
    soc: "4216",
    socTitles: ["Receptionist", "Medical receptionist", "Dental receptionist", "Receptionist-administrator"],
    aliases: ["Front desk receptionist", "Medical receptionist", "Dental receptionist", "Receptionist-administrator"],
    skills: [["s057", 5], ["s002", 4], ["s203", 4], ["s278", 4], ["s200", 4], ["s100", 3], ["s277", 3]],
  },
  {
    key: "administrator",
    title: "Administrator",
    soc: "4159",
    socTitles: ["Administrator", "Administrative assistant", "Clerical assistant", "Office assistant"],
    aliases: ["Administrative assistant", "Office administrator", "Admin assistant", "Clerical assistant", "Office assistant"],
    skills: [["s100", 5], ["s278", 5], ["s054", 4], ["s053", 4], ["s001", 3], ["s203", 3], ["s010", 3], ["s057", 3]],
  },
  {
    key: "personal-assistant",
    title: "Personal assistant",
    soc: "4215",
    socTitles: ["Personal assistant", "Executive assistant", "Secretary"],
    aliases: ["Executive assistant", "PA", "Secretary"],
    skills: [["s203", 5], ["s053", 5], ["s010", 4], ["s001", 4], ["s100", 4], ["s048", 3], ["s156", 3], ["s276", 3]],
  },
  {
    key: "bank-clerk",
    title: "Bank or building society adviser",
    soc: "4123",
    socTitles: ["Bank clerk", "Cashier (banking)", "Customer service adviser (building society)", "Customer service officer (banking)"],
    aliases: ["Bank clerk", "Bank cashier", "Building society adviser", "Customer service officer (banking)"],
    skills: [["s057", 5], ["s054", 4], ["s278", 4], ["s182", 3], ["s005", 3], ["s100", 3]],
  },
  // Care and health
  {
    key: "care-worker",
    title: "Care worker",
    soc: "6135",
    socTitles: ["Care assistant", "Carer", "Home carer", "Support worker (nursing home)"],
    aliases: ["Carer", "Care assistant", "Home carer", "Support worker (care)", "Domiciliary care worker"],
    skills: [["s207", 5], ["s050", 5], ["s170", 4], ["s334", 4], ["s204", 4], ["s278", 3], ["s172", 3], ["s208", 3]],
  },
  {
    key: "senior-care-worker",
    title: "Senior care worker",
    soc: "6136",
    socTitles: ["Senior carer", "Senior care assistant", "Care coordinator (care/residential home)"],
    aliases: ["Senior carer", "Senior care assistant", "Care coordinator", "Care team leader"],
    skills: [["s207", 5], ["s170", 4], ["s237", 4], ["s334", 4], ["s172", 4], ["s278", 4], ["s050", 4], ["s041", 3]],
  },
  {
    key: "dental-nurse",
    title: "Dental nurse",
    soc: "6133",
    socTitles: ["Dental nurse", "Dental assistant", "Dental surgery assistant"],
    aliases: ["Dental assistant", "Dental surgery assistant"],
    skills: [["s232", 5], ["s170", 4], ["s278", 4], ["s054", 4], ["s057", 3], ["s050", 3]],
  },
  // Armed forces
  {
    key: "armed-forces-other-ranks",
    title: "Armed forces (other ranks)",
    soc: "3311",
    socTitles: ["Soldier", "Lance-corporal", "Sergeant (armed forces)", "Aircraftman"],
    aliases: ["Soldier", "Army", "Military", "Armed forces", "Lance corporal", "Corporal", "Sergeant (armed forces)", "Aircraftman", "Royal Marines", "Royal Navy", "RAF"],
    skills: [["s051", 5], ["s041", 4], ["s173", 4], ["s201", 4], ["s053", 4], ["s052", 4], ["s025", 4], ["s054", 3], ["s208", 3]],
  },
  {
    key: "armed-forces-officer",
    title: "Armed forces officer",
    soc: "1161",
    socTitles: ["Army officer", "Royal Navy officer", "Flight-lieutenant", "Squadron-leader"],
    aliases: ["Army officer", "Royal Navy officer", "RAF officer", "Military officer", "Commissioned officer"],
    skills: [["s041", 5], ["s025", 5], ["s042", 4], ["s040", 4], ["s047", 4], ["s201", 4], ["s002", 4], ["s048", 3], ["s044", 3]],
  },
  // Logistics and personal services
  {
    key: "warehouse-operative",
    title: "Warehouse operative",
    soc: "9252",
    socTitles: ["Warehouse operative", "Order picker", "Storeman"],
    aliases: ["Warehouse worker", "Order picker", "Picker packer", "Storeman"],
    skills: [["s265", 4], ["s173", 4], ["s051", 4], ["s054", 4], ["s053", 3]],
  },
  {
    key: "delivery-driver",
    title: "Delivery driver",
    soc: "8214",
    socTitles: ["Delivery driver", "Parcel delivery driver", "Courier-driver"],
    aliases: ["Courier", "Van driver", "Parcel delivery driver", "Multi-drop driver"],
    skills: [["s133", 5], ["s203", 4], ["s053", 4], ["s057", 3], ["s054", 3], ["s173", 3]],
  },
  {
    key: "hairdresser",
    title: "Hairdresser or barber",
    soc: "6221",
    socTitles: ["Hairdresser", "Barber", "Hair stylist"],
    aliases: ["Hairdresser", "Barber", "Hair stylist"],
    skills: [["s057", 5], ["s002", 4], ["s273", 3], ["s155", 3], ["s203", 3], ["s050", 3], ["s005", 3]],
  },
  {
    key: "cabin-crew",
    title: "Cabin crew",
    soc: "6213",
    socTitles: ["Cabin crew", "Flight attendant"],
    aliases: ["Flight attendant", "Air steward", "Air hostess"],
    skills: [["s361", 5], ["s360", 5], ["s057", 4], ["s201", 4], ["s208", 4], ["s051", 4], ["s008", 3]],
  },
];

const BY_KEY = new Map(STARTING_JOBS.map((j) => [j.key, j]));

export function getStartingJob(key: string): StartingJob | undefined {
  return BY_KEY.get(key);
}
