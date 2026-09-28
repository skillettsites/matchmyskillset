// Emails to employers about things candidates do. Shared with the candidate
// side: the apply API calls notifyEmployerOfApplication() after it writes an
// mms_applications row, and the contact accept/decline page can call
// notifyEmployerOfContactResponse(). Both never throw. Server code only.

import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/components/site";
import { skillName } from "@/lib/skills/taxonomy";
import { sendContactResponseToEmployer, sendNewApplication } from "./email";
import { parseSkillIds } from "./matching";
import { linkBase } from "./server";

export interface NotifyResult {
  ok: boolean;
  /** Why nothing was sent, when ok is false or the email was not needed. */
  reason?: string;
}

async function base(): Promise<string> {
  try {
    return await linkBase();
  } catch {
    // Called outside a request (for example from a cron): use the live site.
    return SITE_URL;
  }
}

/**
 * Emails the employer who posted the job that a new application has arrived.
 * Sends at most once per application: employer_notified_at is claimed first,
 * and released again if the email fails so a retry can send it.
 */
export async function notifyEmployerOfApplication(applicationId: string): Promise<NotifyResult> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const claim = await admin
      .from("mms_applications")
      .update({ employer_notified_at: now })
      .eq("id", applicationId)
      .is("employer_notified_at", null)
      .select("id, job_id, name, match_score, matched_skills, cover_note")
      .maybeSingle();
    if (claim.error) return { ok: false, reason: claim.error.message };
    if (!claim.data) return { ok: false, reason: "already_notified_or_missing" };
    const app = claim.data;

    const release = async () => {
      await admin.from("mms_applications").update({ employer_notified_at: null }).eq("id", applicationId);
    };

    const job = await admin.from("mms_jobs").select("id, title, account_id").eq("id", app.job_id).maybeSingle();
    if (job.error || !job.data?.account_id) {
      await release();
      return { ok: false, reason: "job_or_account_missing" };
    }
    const account = await admin.from("mms_employer_accounts").select("email").eq("id", job.data.account_id).maybeSingle();
    if (account.error || !account.data?.email) {
      await release();
      return { ok: false, reason: "account_missing" };
    }

    const url = `${await base()}/employers/dashboard/jobs/${job.data.id}/applicants`;
    const sent = await sendNewApplication(account.data.email, {
      jobTitle: job.data.title,
      name: app.name,
      score: typeof app.match_score === "number" ? app.match_score : null,
      skills: parseSkillIds(app.matched_skills).map(skillName),
      note: app.cover_note,
      url,
    });
    if (!sent.ok) {
      await release();
      return { ok: false, reason: sent.error || "send_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notify] application email failed:", err instanceof Error ? err.message : err);
    return { ok: false, reason: "exception" };
  }
}

/** Tells the employer a candidate accepted or declined their contact request (call after the status is saved). */
export async function notifyEmployerOfContactResponse(requestId: string): Promise<NotifyResult> {
  try {
    const admin = createAdminClient();
    const req = await admin.from("mms_contact_requests").select("id, account_id, candidate_id, status").eq("id", requestId).maybeSingle();
    if (req.error || !req.data) return { ok: false, reason: "request_missing" };
    if (req.data.status !== "accepted" && req.data.status !== "declined") return { ok: false, reason: "not_answered" };
    const [account, candidate] = await Promise.all([
      admin.from("mms_employer_accounts").select("email").eq("id", req.data.account_id).maybeSingle(),
      admin.from("mms_candidates").select('headline, "current_role"').eq("id", req.data.candidate_id).maybeSingle(),
    ]);
    if (!account.data?.email) return { ok: false, reason: "account_missing" };
    const c = candidate.data as { headline: string | null; current_role: string | null } | null;
    const headline = c?.headline || c?.current_role || "Candidate";
    const sent = await sendContactResponseToEmployer(account.data.email, {
      accepted: req.data.status === "accepted",
      headline,
      url: `${await base()}/employers/dashboard/requests`,
    });
    return sent.ok ? { ok: true } : { ok: false, reason: sent.error || "send_failed" };
  } catch (err) {
    console.error("[notify] contact response email failed:", err instanceof Error ? err.message : err);
    return { ok: false, reason: "exception" };
  }
}
