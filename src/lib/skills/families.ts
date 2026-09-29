// Profession families that have their own hub page on the site. When a
// person's current job belongs to one of them, the matcher moves that hub's
// routes (and destinations our career data marks as suiting that group) up
// the list, so results agree with what the hub page recommends.
//
// WHAT IS SOURCED: the SOC 2020 unit groups in each family (titles checked in
// src/data/careers/soc2020.json).
// WHAT IS EDITORIAL: which families exist and the hub route lists, which are
// the curated occupation ids each hub page shows. assertHubRoutes() runs on
// each hub page at build time, so the lists below cannot drift from the pages.

import type { Audience } from "@/data/careers";

export type Family = "teachers" | "police" | "nurses" | "military" | "retail" | "engineering";

interface FamilySpec {
  /** Hub page path. */
  hub: string;
  /** SOC 2020 unit groups whose jobs belong to the family. */
  socs: readonly string[];
  /** Matching value of `audiences` in src/data/careers/occupations.ts, if the dataset has one. */
  audience: Audience | null;
  /** Curated occupation ids shown as routes on the hub page, in page order. */
  routes: readonly string[];
}

export const FAMILIES: Record<Family, FamilySpec> = {
  teachers: {
    hub: "/career-change-from-teaching",
    // Further, secondary, primary, nursery, special needs, EFL and other teachers, and head teachers.
    socs: ["2312", "2313", "2314", "2315", "2316", "2317", "2319", "2321"],
    audience: "teachers",
    routes: [
      "school-business-manager",
      "ofsted-inspector",
      "further-education-lecturer",
      "careers-adviser",
      "private-tutor",
      "learning-and-development-adviser",
      "learning-and-development-manager",
      "e-learning-developer",
      "civil-service-executive-officer",
      "policy-officer",
      "data-analyst",
      "user-researcher",
      "project-manager",
      "social-worker",
      "family-support-worker",
    ],
  },
  police: {
    hub: "/jobs-for-ex-police-officers",
    // Police officers (sergeant and below) and senior police officers.
    socs: ["3312", "1162"],
    audience: "police",
    routes: [
      "fraud-investigator",
      "intelligence-analyst",
      "cyber-security-analyst",
      "trading-standards-officer",
      "security-manager",
      "border-force-officer",
      "compliance-officer",
      "risk-manager",
      "health-and-safety-adviser",
      "probation-services-officer",
      "probation-officer",
      "safeguarding-officer",
      "legal-executive",
      "secondary-school-teacher",
      "driving-instructor",
    ],
  },
  nurses: {
    hub: "/non-clinical-jobs-for-nurses",
    // Registered nurses and midwives.
    socs: ["2231", "2232", "2233", "2234", "2235", "2236", "2237"],
    audience: "nurses",
    routes: [
      "occupational-health-nurse-adviser",
      "clinical-research-associate",
      "nurse-lecturer",
      "health-service-manager",
      "gp-practice-manager",
      "clinical-coder",
      "pals-officer",
      "health-and-safety-adviser",
      "medical-sales-representative",
      "cbt-therapist",
      "project-manager",
      "data-analyst",
      "training-assessor",
      "policy-officer",
      "social-worker",
    ],
  },
  military: {
    hub: "/jobs-for-ex-military",
    // Non-commissioned officers and other ranks, and officers in the armed forces.
    socs: ["3311", "1161"],
    audience: "military",
    routes: [
      "maintenance-fitter",
      "engineering-technician",
      "automation-technician",
      "electrical-electronics-technician",
      "aircraft-maintenance-engineer",
      "field-service-engineer",
      "electrician",
      "3d-printing-technician",
      "quality-engineer",
      "project-manager",
      "production-manager",
      "logistics-manager",
      "transport-manager",
      "facilities-manager",
      "cyber-security-analyst",
      "network-engineer",
      "intelligence-analyst",
      "hgv-driver",
      "train-driver",
      "close-protection-officer",
      "health-and-safety-adviser",
      "secondary-school-teacher",
    ],
  },
  retail: {
    hub: "/career-change-from-retail",
    // Retail managers, sales and retail assistants, cashiers, shopkeepers and retail supervisors.
    socs: ["1150", "7111", "7112", "7131", "7132"],
    audience: null,
    routes: [
      "customer-service-manager",
      "sales-representative",
      "estate-agent",
      "mortgage-adviser",
      "recruitment-consultant",
      "office-manager",
      "hr-officer",
      "bookkeeper",
      "civil-service-executive-officer",
      "warehouse-manager",
      "train-conductor",
      "bus-driver",
      "it-support-technician",
      "healthcare-assistant",
    ],
  },
  engineering: {
    hub: "/engineering-and-manufacturing-jobs",
    // Engineering professionals, engineering and quality technicians, metal, machining,
    // maintenance and electrical trades, and production operatives and assemblers.
    socs: [
      "1121",
      "2122",
      "2123",
      "2124",
      "2125",
      "2126",
      "2127",
      "2129",
      "2481",
      "3112",
      "3113",
      "3115",
      "3116",
      "3120",
      "5211",
      "5212",
      "5213",
      "5214",
      "5221",
      "5222",
      "5223",
      "5224",
      "5231",
      "5232",
      "5234",
      "5236",
      "5241",
      "5246",
      "5249",
      "8114",
      "8119",
      "8120",
      "8139",
      "8141",
      "8142",
      "8143",
      "8149",
    ],
    audience: "technician-upskill",
    routes: [
      "maintenance-fitter",
      "engineering-technician",
      "electrical-electronics-technician",
      "field-service-engineer",
      "cnc-machinist",
      "3d-printing-technician",
      "automation-technician",
      "automation-engineer",
      "robotics-engineer",
      "mechatronics-engineer",
      "embedded-software-engineer",
      "mechanical-engineer",
      "electrical-engineer",
      "electronics-engineer",
      "additive-manufacturing-engineer",
      "manufacturing-engineer",
      "quality-engineer",
      "production-manager",
      "project-engineer",
      "technical-sales-engineer",
      "data-analyst",
    ],
  },
};

const FAMILY_BY_SOC = new Map<string, Family>();
for (const [family, spec] of Object.entries(FAMILIES) as [Family, FamilySpec][]) {
  for (const soc of spec.socs) FAMILY_BY_SOC.set(soc, family);
}

/** The hub family a job belongs to, from its SOC 2020 unit group. */
export function familyForSoc(soc: string | null | undefined): Family | null {
  return soc ? (FAMILY_BY_SOC.get(soc) ?? null) : null;
}

/**
 * Stops the build when a hub page's routes and the list above disagree.
 * Call it once at module level in each hub page with that page's route specs.
 */
export function assertHubRoutes(family: Family, specs: readonly { id: string }[]): void {
  const page = specs.map((s) => s.id);
  const listed = FAMILIES[family].routes;
  const missing = page.filter((id) => !listed.includes(id));
  const extra = listed.filter((id) => !page.includes(id));
  if (missing.length || extra.length) {
    throw new Error(
      `[families] ${FAMILIES[family].hub} routes differ from src/lib/skills/families.ts (${family}). ` +
        `On the page only: ${missing.join(", ") || "none"}. In families.ts only: ${extra.join(", ") || "none"}.`
    );
  }
}
