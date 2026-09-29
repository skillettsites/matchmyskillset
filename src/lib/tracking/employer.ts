// Employer side of journey tracking. Server code only.
//
// Every applicant status change an employer makes (new, viewed, shortlisted,
// interview, offer, hired, not taken forward) is logged. Interview and offer
// count towards the funnel the first time an application reaches them; hired
// records a placement (and moving someone off hired takes the employer's
// confirmation back). Never throws: the status change itself has already been
// saved and must stand.

import { logEvent, reachStage, stageKey, type EventContext } from "./db";
import { emailHash, isTestEmail } from "./sign";
import { fieldOfTitle } from "./field";
import { recordPlacement, retractPlacement } from "./placements";
import type { ApplicationStatus } from "@/lib/employer/types";

export interface StatusChange {
  application: { id: string; email: string; candidate_id: string | null };
  job: { id: string; title: string; company_name: string; location: string | null; soc_code: string | null; account_id: string | null };
  from: string;
  to: ApplicationStatus;
  source?: "employer" | "admin";
}

export async function recordEmployerStatus(change: StatusChange): Promise<void> {
  const { application, job, from, to } = change;
  const source = change.source ?? "employer";
  try {
    const field = fieldOfTitle(job.title);
    const ctx: EventContext = {
      applicationId: application.id,
      jobId: job.id,
      accountId: job.account_id,
      emailHash: emailHash(application.email),
      candidateId: application.candidate_id,
      field,
      channel: "mms",
      isTest: isTestEmail(application.email),
    };
    await logEvent("status", source, to, ctx, { from });
    const key = stageKey({ applicationId: application.id });
    if (to === "interview" || to === "offer") await reachStage(key, to, source, ctx);
    if (to === "hired") {
      const r = await recordPlacement({
        source,
        applicationId: application.id,
        jobId: job.id,
        employerAccountId: job.account_id,
        email: application.email,
        candidateId: application.candidate_id,
        jobTitle: job.title,
        company: job.company_name,
        location: job.location,
        field,
        socCode: job.soc_code,
        channel: "mms",
      });
      if (r === "off") console.info("[tracking] hired: placements not switched on yet (migration 010)");
    } else if (from === "hired") {
      await retractPlacement({ applicationId: application.id }, source);
    }
  } catch (err) {
    console.error("[tracking] employer status record failed:", err instanceof Error ? err.message : err);
  }
}
