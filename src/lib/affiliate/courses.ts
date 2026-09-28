// Where to learn a missing skill, and the official routes for a destination
// job. Server-side. Paid course links go through affiliateUrl() (plain links
// until a programme is approved); free and official links are never
// affiliate links. Every URL here returned 200 on 28 September 2026.

import { getSkill } from "@/lib/skills/taxonomy";
import { SEARCH_URL, affiliateUrl, type ProgrammeId } from "./programmes";

export interface LearnLink {
  label: string;
  provider: string;
  url: string;
  /** Paid platform that may pay us a commission once approved. */
  sponsored: boolean;
  programme?: ProgrammeId;
  note?: string;
}

const enc = encodeURIComponent;

/** Two or three places to learn one skill: UK course marketplace first. */
export function coursesForSkill(skillId: string): LearnLink[] {
  const name = getSkill(skillId)?.name ?? skillId;
  const category = getSkill(skillId)?.category;
  const links: LearnLink[] = [
    {
      label: `${name} courses`,
      provider: "Reed Courses",
      url: affiliateUrl("reed-courses", SEARCH_URL["reed-courses"](name)),
      sponsored: true,
      programme: "reed-courses",
    },
    {
      label: `${name} on Coursera`,
      provider: "Coursera",
      url: affiliateUrl("coursera", SEARCH_URL.coursera(name)),
      sponsored: true,
      programme: "coursera",
    },
  ];
  if (category && ["management", "communication", "analytical", "technical", "digital", "creative", "financial"].includes(category)) {
    links.push({
      label: `${name} on LinkedIn Learning`,
      provider: "LinkedIn Learning",
      url: affiliateUrl("linkedin-learning", SEARCH_URL["linkedin-learning"](name)),
      sponsored: true,
      programme: "linkedin-learning",
    });
  }
  return links;
}

/** Official pages for qualifications named on National Careers Service profiles. */
const QUALIFICATION_PAGES: Record<string, { label: string; url: string }> = {
  CIPD: { label: "CIPD qualifications", url: "https://www.cipd.org/uk/learning/qualifications/" },
  AAT: { label: "AAT qualifications", url: "https://www.aat.org.uk/qualifications-and-courses" },
  PRINCE2: { label: "PRINCE2 (PeopleCert Axelos)", url: "https://www.axelos.com/certifications/propath/prince2-project-management" },
  NEBOSH: { label: "NEBOSH qualifications", url: "https://www.nebosh.org.uk/qualifications/" },
  CompTIA: { label: "CompTIA certifications", url: "https://www.comptia.org/en-us/certifications/" },
  PGCE: { label: "Train to teach (Get Into Teaching, DfE)", url: "https://getintoteaching.education.gov.uk/train-to-be-a-teacher" },
  BACP: { label: "Training to become a therapist (BACP)", url: "https://www.bacp.co.uk/careers/counselling-and-therapy-as-a-career/training-to-become-a-therapist/" },
  CILEx: { label: "CILEX qualifications", url: "https://www.cilex.org.uk/qualifications/" },
  CIM: { label: "CIM marketing qualifications", url: "https://www.cim.co.uk/qualifications/" },
};

export function qualificationLinks(names: string[]): LearnLink[] {
  return names
    .map((n) => QUALIFICATION_PAGES[n])
    .filter(Boolean)
    .map((q) => ({ label: q.label, provider: "Official body", url: q.url, sponsored: false }));
}

/** Google Career Certificates (on Coursera) that line up with a destination. */
const GOOGLE_CERTS: Record<string, { label: string; slug: string }> = {
  "data-analyst": { label: "Google Data Analytics Certificate", slug: "google-data-analytics" },
  "it-support-technician": { label: "Google IT Support Certificate", slug: "google-it-support" },
  "ux-designer": { label: "Google UX Design Certificate", slug: "google-ux-design" },
  "user-researcher": { label: "Google UX Design Certificate", slug: "google-ux-design" },
  "project-manager": { label: "Google Project Management Certificate", slug: "google-project-management" },
  "it-project-manager": { label: "Google Project Management Certificate", slug: "google-project-management" },
  "project-support-officer": { label: "Google Project Management Certificate", slug: "google-project-management" },
  "marketing-executive": { label: "Google Digital Marketing and E-commerce Certificate", slug: "google-digital-marketing-ecommerce" },
  "social-media-manager": { label: "Google Digital Marketing and E-commerce Certificate", slug: "google-digital-marketing-ecommerce" },
  "cyber-security-analyst": { label: "Google Cybersecurity Certificate", slug: "google-cybersecurity" },
};

export function occupationCourseLinks(occupationId: string): LearnLink[] {
  const links: LearnLink[] = [];
  const cert = GOOGLE_CERTS[occupationId];
  if (cert) {
    links.push({
      label: cert.label,
      provider: "Coursera",
      url: affiliateUrl("coursera", `https://www.coursera.org/professional-certificates/${cert.slug}`),
      sponsored: true,
      programme: "coursera",
    });
  }
  if (occupationId === "efl-teacher") {
    links.push({
      label: "TEFL courses",
      provider: "The TEFL Org",
      url: affiliateUrl("tefl-org", "https://www.tefl.org/courses/"),
      sponsored: true,
      programme: "tefl-org",
    });
  }
  return links;
}

/** Search term for the official Skills Bootcamps finder, where bootcamps exist for the field. */
const BOOTCAMP_TERMS: [RegExp, string][] = [
  [/data|analyst|business-intelligence/, "data"],
  [/software|web-developer|tester|developer/, "software"],
  [/cyber/, "cyber"],
  [/it-support|network|telecoms/, "IT"],
  [/ux|user-researcher|e-learning/, "digital"],
  [/marketing|social-media|copywriter/, "digital marketing"],
  [/project/, "project management"],
  [/hgv|bus-driver/, "HGV"],
  [/electrician|plumber|carpenter|bricklayer|plasterer|construction|scaffolder|welder|air-conditioning/, "construction"],
  [/hr-|recruitment|learning-and-development/, "HR"],
  [/accountant|accounting|bookkeeper/, "accounting"],
];

/** Government-funded Skills Bootcamps (England), via the National Careers Service course finder. */
export function skillsBootcampLink(occupationId: string): LearnLink {
  const term = BOOTCAMP_TERMS.find(([re]) => re.test(occupationId))?.[1] ?? "";
  return {
    label: term ? `Skills Bootcamps in ${term}` : "Skills Bootcamps",
    provider: "National Careers Service (GOV.UK)",
    url:
      "https://nationalcareers.service.gov.uk/find-a-course/page?" +
      `searchTerm=${enc(term)}&distance=10%20miles&town=&orderByValue=Relevance&startDate=Anytime&courseType=Skills%20Bootcamp&sectors=&learningMethod=&courseHours=&courseStudyTime=&filterA=true&page=1&D=0&coordinates=&campaignCode=&qualificationLevels=`,
    sponsored: false,
    // Wording checked against the Department for Education pages on 28 September 2026.
    note: "Government-funded courses of up to 16 weeks for adults aged 19 or over in England. Most need no previous knowledge of the subject, and you are guaranteed a job interview at the end. Check each listing for any cost.",
  };
}

export const SKILLS_BOOTCAMP_INFO_URL = "https://www.skillsforcareers.education.gov.uk/pages/training-choice/skills-bootcamp";
export const FIND_APPRENTICESHIP_URL = "https://www.gov.uk/apply-apprenticeship";

export function cvBuilderLink(): LearnLink {
  return { label: "CV templates", provider: "Resume.io", url: affiliateUrl("resume-io", "https://resume.io/"), sponsored: true, programme: "resume-io" };
}
