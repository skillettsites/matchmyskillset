// Licences, registrations and industry cards referenced by the curated occupations.
//
// Every entry points at the official body's page. scripts/ashe/fetch-references.mjs
// fetches each page and records whether it loads and contains the listed phrases
// (src/data/careers/sources/licence-checks.json). The summaries are written in our
// own words and only say what those pages, the National Careers Service profile or
// the ONS SOC 2020 entry text for the occupation support.
//
// An occupation may list a licence only when the validator can find evidence for
// that pairing: a keyword on the occupation's NCS profile, a keyword in the ONS
// SOC 2020 entry-route text for its unit group, or an `appliesVia` phrase checked
// on the licence body's own page.

export type LicenceKind = "statutory registration" | "statutory licence" | "required qualification" | "industry card";

export interface LicenceSource {
  readonly url: string;
  /** Phrases the page must contain (case-insensitive) for the check to pass. */
  readonly phrases: readonly string[];
}

export interface Licence {
  readonly id: string;
  readonly name: string;
  readonly body: string;
  readonly kind: LicenceKind;
  readonly summary: string;
  /** Where the requirement applies, when narrower than the UK. */
  readonly scope?: string;
  readonly sources: readonly LicenceSource[];
  /** Words used to find evidence in NCS profile text and ONS entry-route text. */
  readonly keywords: readonly string[];
  /** Occupation id to a phrase on one of the sources that shows the licence applies to it. */
  readonly appliesVia?: Readonly<Record<string, string>>;
}

export const LICENCES = {
  "sia-licence": {
    id: "sia-licence",
    name: "SIA licence",
    body: "Security Industry Authority",
    kind: "statutory licence",
    summary:
      "A Security Industry Authority licence is needed for licensable security work such as door supervision and contracted security guarding. The National Careers Service notes it is needed for agency and contractor jobs.",
    sources: [{ url: "https://www.gov.uk/guidance/apply-for-an-sia-licence", phrases: ["SIA licence", "door supervis"] }],
    keywords: ["Security Industry Authority", "SIA licence", "SIA"],
  },
  "cscs-card": {
    id: "cscs-card",
    name: "CSCS card",
    body: "Construction Skills Certification Scheme",
    kind: "industry card",
    summary:
      "An industry card that shows you have the training and qualifications for your job on a construction site. The National Careers Service says you need a CSCS card or equivalent to train and work on a construction site.",
    sources: [{ url: "https://www.cscs.uk.com/applying-for-cards/", phrases: ["CSCS"] }],
    keywords: ["CSCS", "Construction Skills Certification Scheme"],
  },
  "cisrs-card": {
    id: "cisrs-card",
    name: "CISRS card",
    body: "Construction Industry Scaffolders Record Scheme",
    kind: "industry card",
    summary:
      "The scaffolding industry's card scheme. ONS and the National Careers Service both say scaffolders need a CISRS card (or equivalent) to work on site.",
    sources: [{ url: "https://cisrs.org.uk/", phrases: ["CISRS", "scaffold"] }],
    keywords: ["CISRS", "scaffolders record scheme"],
  },
  "cpcs-card": {
    id: "cpcs-card",
    name: "CPCS card",
    body: "Construction Plant Competence Scheme (NOCN Group)",
    kind: "industry card",
    summary:
      "A card showing competence to operate construction plant. ONS says crane operators are required to hold a CPCS card; the National Careers Service says you usually need a CPCS or NPORS card to work on a site.",
    sources: [
      {
        url: "https://www.nocn.org.uk/products/competence-cards-and-tests/construction-plant-competence-scheme-cpcs/",
        phrases: ["CPCS"],
      },
    ],
    keywords: ["CPCS", "Construction Plant Competence Scheme"],
  },
  "nmc-registration": {
    id: "nmc-registration",
    name: "NMC registration",
    body: "Nursing and Midwifery Council",
    kind: "statutory registration",
    summary: "Registration with the Nursing and Midwifery Council is needed to work as a registered nurse, midwife or nursing associate.",
    sources: [{ url: "https://www.nmc.org.uk/registration/", phrases: ["register", "nurse"] }],
    keywords: ["Nursing and Midwifery Council", "NMC"],
  },
  "hcpc-registration": {
    id: "hcpc-registration",
    name: "HCPC registration",
    body: "Health and Care Professions Council",
    kind: "statutory registration",
    summary:
      "Registration with the Health and Care Professions Council is needed to practise in the professions it regulates, which include paramedics, occupational therapists and practitioner psychologists.",
    sources: [
      { url: "https://www.hcpc-uk.org/registration/getting-on-the-register/", phrases: ["register"] },
      {
        url: "https://www.hcpc-uk.org/about-us/who-we-regulate/the-professions/",
        phrases: ["Practitioner psychologist", "Paramedic", "Occupational therapist"],
      },
    ],
    keywords: ["Health and Care Professions Council", "HCPC", "Health Professions Council"],
    appliesVia: { "educational-psychologist": "Practitioner psychologist" },
  },
  qts: {
    id: "qts",
    name: "Qualified teacher status (QTS)",
    body: "Department for Education",
    kind: "required qualification",
    scope: "England",
    summary: "Qualified teacher status is usually needed to teach in a state school in England.",
    sources: [{ url: "https://www.gov.uk/guidance/qualified-teacher-status-qts", phrases: ["qualified teacher status"] }],
    keywords: ["qualified teacher status", "QTS"],
  },
  "social-work-registration": {
    id: "social-work-registration",
    name: "Social worker registration",
    body: "Social Work England (in England)",
    kind: "statutory registration",
    summary:
      "Social work is a regulated profession: ONS notes practitioners must be registered with the appropriate statutory body. In England that is Social Work England.",
    sources: [{ url: "https://www.socialworkengland.org.uk/registration/", phrases: ["register"] }],
    keywords: ["Social Work England", "registered with the appropriate statutory body"],
  },
  "gas-safe-register": {
    id: "gas-safe-register",
    name: "Gas Safe registration",
    body: "Gas Safe Register",
    kind: "statutory registration",
    summary:
      "By law, gas engineers must be on the Gas Safe Register (ONS). The National Careers Service says you must be on it to work on domestic gas heating systems.",
    sources: [{ url: "https://www.hse.gov.uk/gas/gas-safe-register-check.htm", phrases: ["Gas Safe"] }],
    keywords: ["Gas Safe"],
  },
  "lgv-licence-driver-cpc": {
    id: "lgv-licence-driver-cpc",
    name: "Lorry licence and Driver CPC",
    body: "Driver and Vehicle Standards Agency",
    kind: "statutory licence",
    summary:
      "You need the right lorry licence category, and GOV.UK says you must have the full Driver Certificate of Professional Competence (Driver CPC) if you drive an HGV as the main part of your job.",
    sources: [{ url: "https://www.gov.uk/become-lorry-bus-driver", phrases: ["Certificate of Professional Competence"] }],
    keywords: ["Driver CPC", "Certificate of Professional Competence"],
  },
  "pcv-licence-driver-cpc": {
    id: "pcv-licence-driver-cpc",
    name: "Bus licence and Driver CPC",
    body: "Driver and Vehicle Standards Agency",
    kind: "statutory licence",
    summary:
      "You need the right bus licence category, and GOV.UK says you must have the full Driver Certificate of Professional Competence (Driver CPC) if you drive a bus or coach as the main part of your job.",
    sources: [{ url: "https://www.gov.uk/become-lorry-bus-driver", phrases: ["Certificate of Professional Competence", "bus"] }],
    keywords: ["Driver CPC", "Certificate of Professional Competence"],
  },
  "adi-register": {
    id: "adi-register",
    name: "Approved driving instructor (ADI) registration",
    body: "Driver and Vehicle Standards Agency",
    kind: "statutory registration",
    summary: "You must be on the Approved Driving Instructor register to charge for car driving lessons, and renew it every 4 years (National Careers Service).",
    sources: [{ url: "https://www.gov.uk/become-a-driving-instructor", phrases: ["approved driving instructor"] }],
    keywords: ["Approved Driving Instructor", "ADI"],
  },
  sqe: {
    id: "sqe",
    name: "Solicitors Qualifying Examination (SQE)",
    body: "Solicitors Regulation Authority",
    kind: "required qualification",
    scope: "England and Wales",
    summary: "New solicitors in England and Wales qualify through the Solicitors Qualifying Examination set by the Solicitors Regulation Authority.",
    sources: [{ url: "https://www.sra.org.uk/become-solicitor/sqe/", phrases: ["Solicitors Qualifying Examination"] }],
    keywords: ["SQE", "Solicitors Qualifying Examination", "Solicitor's Qualifying Examination"],
  },
  "transport-manager-cpc": {
    id: "transport-manager-cpc",
    name: "Transport Manager CPC",
    body: "Traffic commissioners (GOV.UK)",
    kind: "required qualification",
    summary: "GOV.UK says you need the Transport Manager Certificate of Professional Competence to become a transport manager for a goods or passenger vehicle operator.",
    sources: [{ url: "https://www.gov.uk/become-transport-manager", phrases: ["Certificate of Professional Competence"] }],
    keywords: ["Transport Manager Certificate of Professional Competence", "Transport Manager CPC"],
  },
  "train-driving-licence": {
    id: "train-driving-licence",
    name: "Train driving licence and certificate",
    body: "Office of Rail and Road",
    kind: "statutory licence",
    summary: "Train drivers hold a train driving licence and certificate under the scheme overseen by the Office of Rail and Road.",
    sources: [
      {
        url: "https://www.orr.gov.uk/rail-guidance-compliance/train-driving-licences-and-certificates",
        phrases: ["train driving licence"],
      },
    ],
    keywords: ["train driving licence", "train driving licences"],
    appliesVia: { "train-driver": "train driving licence" },
  },
  "atco-licence": {
    id: "atco-licence",
    name: "Air traffic controller licence",
    body: "UK Civil Aviation Authority",
    kind: "statutory licence",
    summary: "Air traffic controllers need a licence from the UK Civil Aviation Authority. ONS notes entrants must be 21 to hold a full licence.",
    sources: [
      {
        url: "https://www.caa.co.uk/commercial-industry/airspace/air-traffic-management-and-air-navigational-services/licences-for-air-traffic-roles/",
        phrases: ["Air traffic controller licence"],
      },
    ],
    keywords: ["air traffic controller licence"],
  },
  "f-gas-certificate": {
    id: "f-gas-certificate",
    name: "F gas certificate",
    body: "Department for Environment, Food and Rural Affairs (GOV.UK guidance)",
    kind: "required qualification",
    summary:
      "Engineers working on equipment that contains fluorinated greenhouse gases, such as air conditioning, refrigeration and heat pumps, need F gas certification.",
    sources: [
      {
        url: "https://www.gov.uk/government/collections/fluorinated-gas-f-gas-guidance-for-users-producers-and-traders",
        phrases: ["F gas"],
      },
    ],
    keywords: ["F Gas", "F-gas", "fluorinated"],
  },
} as const satisfies Record<string, Licence>;

export type LicenceId = keyof typeof LICENCES;

export function getLicence(id: LicenceId): Licence {
  return LICENCES[id];
}
