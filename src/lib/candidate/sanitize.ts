// Reads job pack content back from the database or from the person's edits,
// keeping only the expected shape and sensible lengths. Pure: no app imports,
// so both the server and the pack editor can use it.

import { line, paragraphs } from "./grounding";
import { EMPTY_CV, type CvRole, type Gap, type InterviewPrep, type PackChecks, type PackFit, type PackJob, type TailoredCv } from "./pack-types";

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function list(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function texts(v: unknown, max: number, len: number): string[] {
  return list(v)
    .map((s) => line(s, len))
    .filter(Boolean)
    .slice(0, max);
}

export function readJob(v: unknown): PackJob {
  const o = obj(v);
  return {
    title: line(o.title, 200) || "Untitled job",
    company: line(o.company, 160),
    location: line(o.location, 160) || undefined,
    url: typeof o.url === "string" && /^(https?:\/\/|\/)/.test(o.url) ? o.url.slice(0, 600) : undefined,
    source: line(o.source, 40) || "pasted",
    sourceLabel: line(o.sourceLabel, 60) || undefined,
    jobId: line(o.jobId, 160) || undefined,
    description: typeof o.description === "string" ? o.description.slice(0, 12_000) : "",
    fullText: o.fullText === true,
    salary: line(o.salary, 120) || undefined,
  };
}

export function readCv(v: unknown): TailoredCv | null {
  if (!v || typeof v !== "object") return null;
  const o = obj(v);
  const c = obj(o.contact);
  const role = (r: unknown): CvRole => {
    const x = obj(r);
    return { title: line(x.title, 140), employer: line(x.employer, 140), location: line(x.location, 100), dates: line(x.dates, 60, true), bullets: texts(x.bullets, 10, 400) };
  };
  return {
    contact: {
      name: line(c.name, 100) || null,
      email: line(c.email, 120) || null,
      phone: line(c.phone, 40) || null,
      location: line(c.location, 100) || null,
      links: texts(c.links, 4, 200),
    },
    summary: line(o.summary, 1500),
    keySkills: texts(o.keySkills, 20, 80),
    experience: list(o.experience)
      .map(role)
      .filter((r) => r.title || r.employer || r.bullets.length)
      .slice(0, 20),
    education: list(o.education)
      .map((e) => {
        const x = obj(e);
        return { qualification: line(x.qualification, 200), institution: line(x.institution, 160), dates: line(x.dates, 60, true) };
      })
      .filter((e) => e.qualification || e.institution)
      .slice(0, 12),
    certifications: texts(o.certifications, 20, 200),
    otherSections: list(o.otherSections)
      .map((s) => {
        const x = obj(s);
        return { heading: line(x.heading, 60), items: texts(x.items, 12, 240) };
      })
      .filter((s) => s.heading && s.items.length)
      .slice(0, 6),
  };
}

export function readPrep(v: unknown): InterviewPrep | null {
  if (!v || typeof v !== "object") return null;
  const o = obj(v);
  return {
    questions: list(o.questions)
      .map((q) => {
        const x = obj(q);
        return { question: line(x.question, 400), whyTheyAsk: line(x.whyTheyAsk, 500), answerPoints: texts(x.answerPoints, 6, 500) };
      })
      .filter((q) => q.question)
      .slice(0, 14),
    questionsToAsk: texts(o.questionsToAsk, 6, 300),
  };
}

export function readLetter(v: unknown): string | null {
  const t = paragraphs(v, 6000);
  return t || null;
}

export function readGaps(v: unknown): Gap[] {
  return list(v)
    .map((g) => {
      const x = obj(g);
      return { requirement: line(x.requirement, 160), note: line(x.note, 400) };
    })
    .filter((g) => g.requirement)
    .slice(0, 16);
}

export function readChecks(v: unknown): PackChecks | null {
  if (!v || typeof v !== "object") return null;
  const o = obj(v);
  return {
    changes: texts(o.changes, 8, 300),
    removed: list(o.removed)
      .map((r) => {
        const x = obj(r);
        return { where: line(x.where, 120), text: line(x.text, 500), why: line(x.why, 200) };
      })
      .filter((r) => r.text)
      .slice(0, 40),
    review: texts(o.review, 12, 300),
  };
}

export function readFit(v: unknown): PackFit | null {
  if (!v || typeof v !== "object") return null;
  const o = obj(v);
  return {
    match: typeof o.match === "number" && o.match >= 0 && o.match <= 100 ? Math.round(o.match) : null,
    explain: line(o.explain, 1200) || null,
    matched: texts(o.matched, 20, 80),
    missing: texts(o.missing, 20, 80),
  };
}

export { EMPTY_CV };
