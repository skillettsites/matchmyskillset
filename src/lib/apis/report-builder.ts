// Builds (once) the paid Career Change Report for one purchase. Called by the
// Stripe webhook and, if the webhook has not finished, by the report page.
// Server-side only.

import { getCareerOccupation } from "@/data/careers";
import { isMatchesDoc, isSkillsDoc, type MatchEntry, type SkillsDoc } from "@/lib/skills/profile";
import { presentMatch, resolveCurrentJob, type PresentedMatch } from "@/lib/skills/present";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateCareerReport, type ReportFacts } from "./claude";
import {
  claimReportGeneration,
  loadStoredReport,
  releaseReportClaim,
  saveStoredReport,
  type PurchaseRow,
  type ReportRow,
  type StoredReport,
} from "./reports-db";

/** Finds the match the person paid for: by occupation id when recorded, else by SOC code. */
export function findPurchasedMatch(report: ReportRow, occupationId: string | null | undefined, targetSoc: string | null | undefined): MatchEntry | null {
  if (!isMatchesDoc(report.matches)) return null;
  const items = report.matches.items;
  if (occupationId) {
    const byId = items.find((m) => m.occupationId === occupationId);
    if (byId) return byId;
  }
  if (targetSoc) {
    return items.find((m) => getCareerOccupation(m.occupationId)?.soc === targetSoc) ?? null;
  }
  return null;
}

export function buildReportFacts(doc: SkillsDoc | null, match: PresentedMatch): ReportFacts {
  return {
    destination: {
      title: match.title,
      description: match.description,
      socCode: match.soc,
      socTitle: match.socTitle,
      degreeUsuallyRequired: match.degreeUsuallyRequired,
      apprenticeships: match.apprenticeships.map((a) => ({ title: a.title, level: a.level, typicalDurationMonths: a.typicalDurationMonths ?? null })),
      licences: match.licences.map((l) => ({ name: l.name, summary: l.summary, ...(l.scope ? { scope: l.scope } : {}) })),
      qualifications: match.qualifications,
      nationalCareersServiceRoutes: match.ncsRoutes,
      nationalCareersServiceEntryRequirements: match.ncsEntryRequirements,
      onsEntryRoutes: match.onsEntryRoutes,
    },
    person: {
      currentRole: doc?.currentRole ?? null,
      seniority: doc?.seniority ?? "unknown",
      yearsExperience: doc?.yearsExperience ?? null,
      whatMatters: doc?.preferences.note ?? null,
      achievements: doc?.achievements ?? [],
    },
    skillsTheyHave: match.matched.map((s) => ({ id: s.id, name: s.name, ...(s.evidence ? { evidence: s.evidence } : {}) })),
    closeSkills: match.related.map((s) => ({ id: s.id, name: s.name, theirRelatedSkill: s.viaName ?? "" })),
    gapSkills: match.gaps.map((s) => ({ id: s.id, name: s.name, importance: s.importance })),
  };
}

export type EnsureResult =
  | { status: "ready"; content: StoredReport }
  | { status: "busy" }
  | { status: "failed"; reason: string };

/**
 * Returns the stored report, generating it first if needed. Safe to call from
 * several places at once: only the caller that wins the claim pays for the
 * model call; the others get "busy" and should check again shortly.
 */
export async function ensureReport(purchase: PurchaseRow, report: ReportRow): Promise<EnsureResult> {
  const existing = loadStoredReport(purchase, report);
  if (existing) return { status: "ready", content: existing };

  const entry = findPurchasedMatch(report, purchase.occupation_id, purchase.target_soc);
  if (!entry) return { status: "failed", reason: "The career you chose is no longer in these results." };

  const doc = isSkillsDoc(report.skills) ? report.skills : null;
  const presented = presentMatch(entry, doc, resolveCurrentJob(doc));
  if (!presented) return { status: "failed", reason: "The career you chose is no longer in our data." };

  let claim: "claimed" | "busy" | "untracked" | "soft" = await claimReportGeneration(purchase.id);
  if (claim === "untracked") {
    // Until migration 005 adds the claim column, use the shared rate-limit
    // counter as the lock: the first caller in a 5-minute window gets 1.
    const { allowed } = await checkRateLimit(`report-claim:${purchase.id}`, 1, 300);
    claim = allowed ? "soft" : "busy";
  }
  if (claim === "busy") return { status: "busy" };

  try {
    const result = await generateCareerReport(buildReportFacts(doc, presented));
    const content: StoredReport = {
      v: 1,
      occupationId: entry.occupationId,
      generatedAt: new Date().toISOString(),
      model: result.model,
      prose: result.prose,
      usage: result.usage,
    };
    await saveStoredReport(purchase, report, content);
    console.log(
      `[report] generated for purchase ${purchase.id} in ${result.ms}ms: ${result.usage.inputTokens} in, ${result.usage.outputTokens} out, ${result.usage.cacheReadTokens} cached, about $${result.usage.costUsd}`
    );
    return { status: "ready", content };
  } catch (err) {
    console.error("[report] generation failed:", err instanceof Error ? err.message : err);
    if (claim === "claimed") await releaseReportClaim(purchase.id);
    return { status: "failed", reason: "We could not write your report just now." };
  }
}
