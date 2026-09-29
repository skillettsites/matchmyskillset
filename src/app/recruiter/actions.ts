"use server";

// Recruiter workspace actions. Every action checks the recruiter cookie
// itself (Server Actions can be called by direct POST). Recruiters can only
// sign in, work on shortlists and send them: nothing here touches plans,
// billing, job approval or employer accounts.

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { SITE_URL } from "@/components/site";
import { checkRecruiterPassword, endRecruiterSession, isRecruiter, startRecruiterSession } from "@/lib/employer/recruiter-auth";
import { sendShortlistReady } from "@/lib/employer/email";
import { notifyOwner } from "@/lib/employer/telegram";
import { isUuid, linkBase, requestIp } from "@/lib/employer/server";
import { cleanRecruiterText, getShortlist, MAX_NOTE_LENGTH, MAX_SHORTLIST_ITEMS, MAX_SUMMARY_LENGTH, SHORTLISTS_OFF } from "@/lib/employer/shortlists";
import { isTestEmail } from "@/lib/employer/recruiter";

export interface RecruiterLoginState {
  error?: string;
}

export async function recruiterSignIn(_prev: RecruiterLoginState, form: FormData): Promise<RecruiterLoginState> {
  const { allowed } = await checkRateLimit(`recruiter-login:${await requestIp()}`, 10, 900);
  if (!allowed) return { error: "Too many attempts. Try again in 15 minutes." };
  if (!checkRecruiterPassword(String(form.get("password") ?? ""))) return { error: "That password is not right." };
  await startRecruiterSession();
  redirect("/recruiter");
}

export async function recruiterSignOut(): Promise<void> {
  await endRecruiterSession();
  redirect("/recruiter");
}

async function guard(): Promise<void> {
  if (!(await isRecruiter())) redirect("/recruiter");
}

export interface SaveState {
  ok: boolean;
  message: string;
}

interface Pick {
  kind: "application" | "candidate";
  id: string;
  note: string;
}

function readPicks(raw: unknown): Pick[] | null {
  if (typeof raw !== "string" || raw.length > 60_000) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const out: Pick[] = [];
  const seen = new Set<string>();
  for (const item of parsed.slice(0, MAX_SHORTLIST_ITEMS + 5)) {
    if (!item || typeof item !== "object") continue;
    const { kind, id, note } = item as Record<string, unknown>;
    if ((kind !== "application" && kind !== "candidate") || !isUuid(id)) continue;
    const key = `${kind}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind, id, note: typeof note === "string" ? note : "" });
  }
  return out;
}

/** Saves the picks, order, notes and summary; with intent "send", also sends the shortlist to the employer. */
export async function saveShortlist(_prev: SaveState | null, form: FormData): Promise<SaveState> {
  await guard();
  const { allowed } = await checkRateLimit(`recruiter-save:${await requestIp()}`, 240, 3600);
  if (!allowed) return { ok: false, message: "Too many saves in the last hour. Please wait a few minutes." };

  const id = String(form.get("shortlist_id") ?? "");
  const send = form.get("intent") === "send";
  if (!isUuid(id)) return { ok: false, message: "That shortlist was not found." };
  const picks = readPicks(form.get("items"));
  if (!picks) return { ok: false, message: "We could not read your picks. Please reload the page and try again." };
  if (picks.length > MAX_SHORTLIST_ITEMS) return { ok: false, message: `A shortlist can have up to ${MAX_SHORTLIST_ITEMS} people.` };
  if (send && picks.length === 0) return { ok: false, message: "Add at least one person before sending." };

  const { ready, shortlist } = await getShortlist(id);
  if (!ready) return { ok: false, message: SHORTLISTS_OFF };
  if (!shortlist) return { ok: false, message: "That shortlist was not found." };
  if (shortlist.status === "sent") return { ok: false, message: "This shortlist has already been sent, so it can no longer be changed." };
  if (shortlist.status === "cancelled") return { ok: false, message: "This request was cancelled." };

  const admin = createAdminClient();
  const jobRes = await admin.from("mms_jobs").select("id, title, company_name, account_id").eq("id", shortlist.job_id).maybeSingle();
  const job = jobRes.data as { id: string; title: string; company_name: string; account_id: string | null } | null;
  if (!job) return { ok: false, message: "The job for this shortlist no longer exists." };

  // Applications must be to this job. Candidates must still be findable, and
  // someone who applied is shortlisted as the applicant, never twice.
  const appIds = picks.filter((p) => p.kind === "application").map((p) => p.id);
  const candIds = picks.filter((p) => p.kind === "candidate").map((p) => p.id);
  const [appsRes, candsRes, appliedRes] = await Promise.all([
    appIds.length ? admin.from("mms_applications").select("id, name").eq("job_id", job.id).in("id", appIds) : Promise.resolve({ data: [], error: null }),
    candIds.length
      ? admin.from("mms_candidates").select("id, first_name, email, discoverable, withdrawn_at, expires_at").in("id", candIds)
      : Promise.resolve({ data: [], error: null }),
    admin.from("mms_applications").select("candidate_id").eq("job_id", job.id).not("candidate_id", "is", null).limit(2000),
  ]);
  if (appsRes.error || candsRes.error) return { ok: false, message: "We could not check the people you picked. Please try again." };
  const validApps = new Set((appsRes.data ?? []).map((a) => a.id as string));
  const appliedCandidates = new Set((appliedRes.data ?? []).map((a) => a.candidate_id as string));
  const now = Date.now();
  const candInfo = new Map<string, { firstName: string | null }>();
  for (const c of (candsRes.data ?? []) as { id: string; first_name: string | null; email: string; discoverable: boolean; withdrawn_at: string | null; expires_at: string | null }[]) {
    const live = c.discoverable && !c.withdrawn_at && (!c.expires_at || new Date(c.expires_at).getTime() > now);
    if (live && !isTestEmail(c.email) && !appliedCandidates.has(c.id)) candInfo.set(c.id, { firstName: c.first_name });
  }
  const kept = picks.filter((p) => (p.kind === "application" ? validApps.has(p.id) : candInfo.has(p.id)));
  const dropped = picks.length - kept.length;
  if (send && kept.length === 0) return { ok: false, message: "None of the people you picked can be shortlisted any more. Please pick again." };

  // Notes are shown to the employer: no contact details, links or (for anonymous people) their name.
  const rows = kept.map((p, i) => ({
    shortlist_id: shortlist.id,
    application_id: p.kind === "application" ? p.id : null,
    candidate_id: p.kind === "candidate" ? p.id : null,
    rank: i + 1,
    recruiter_note: cleanRecruiterText(p.note, MAX_NOTE_LENGTH, p.kind === "candidate" ? [candInfo.get(p.id)?.firstName] : []) || null,
  }));
  const anonNames = kept.filter((p) => p.kind === "candidate").map((p) => candInfo.get(p.id)?.firstName);
  const summary = cleanRecruiterText(form.get("summary"), MAX_SUMMARY_LENGTH, anonNames) || null;
  const recruiterName = cleanText(form.get("recruiter_name"), 80) || null;

  const del = await admin.from("mms_shortlist_items").delete().eq("shortlist_id", shortlist.id);
  if (del.error) return { ok: false, message: "We could not save the shortlist just now. Please try again." };
  if (rows.length) {
    const ins = await admin.from("mms_shortlist_items").insert(rows);
    if (ins.error) {
      console.error("[recruiter] items insert failed:", ins.error.message);
      return { ok: false, message: "We could not save the shortlist just now. Please try again." };
    }
  }

  const stamp = new Date().toISOString();
  const base = { recruiter_name: recruiterName, summary, updated_at: stamp, started_at: shortlist.started_at ?? stamp };
  if (!send) {
    const { error } = await admin
      .from("mms_shortlists")
      .update({ ...base, status: "in_progress" })
      .eq("id", shortlist.id)
      .in("status", ["requested", "in_progress"]);
    if (error) return { ok: false, message: "We could not save the shortlist just now. Please try again." };
    return {
      ok: true,
      message: `Saved ${rows.length} ${rows.length === 1 ? "person" : "people"}.${dropped ? ` ${dropped} could not be kept: they withdrew, or they are also an applicant.` : ""} The employer sees nothing until you send it.`,
    };
  }

  // Only the first send wins, so the employer is never emailed twice.
  const flipped = await admin
    .from("mms_shortlists")
    .update({ ...base, status: "sent", sent_at: stamp })
    .eq("id", shortlist.id)
    .in("status", ["requested", "in_progress"])
    .select("id")
    .maybeSingle();
  if (flipped.error || !flipped.data) return { ok: false, message: "This shortlist could not be sent: it may have been sent or cancelled already. Reload the page." };

  const account = job.account_id ? await admin.from("mms_employer_accounts").select("email").eq("id", job.account_id).maybeSingle() : null;
  const email = account?.data?.email as string | undefined;
  const mail = email
    ? await sendShortlistReady(email, {
        jobTitle: job.title,
        count: rows.length,
        applicants: rows.filter((r) => r.application_id).length,
        recruiter: recruiterName,
        summary,
        url: `${await linkBase()}/employers/dashboard/jobs/${job.id}/shortlist`,
      })
    : { ok: false };
  await notifyOwner(
    ["MatchMySkillset recruiter shortlist sent", `${job.title} at ${job.company_name}`, `${rows.length} ${rows.length === 1 ? "person" : "people"}${recruiterName ? `, by ${recruiterName}` : ""}`, mail.ok ? "Employer emailed" : "Employer email FAILED"],
    [{ text: "Open admin", url: `${SITE_URL}/admin#shortlists` }]
  );
  redirect(`/recruiter?sent=${encodeURIComponent(job.title)}${mail.ok ? "" : "&mail=failed"}`);
}

export async function cancelShortlist(form: FormData): Promise<void> {
  await guard();
  const id = String(form.get("shortlist_id") ?? "");
  if (!isUuid(id)) redirect("/recruiter");
  await createAdminClient()
    .from("mms_shortlists")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["requested", "in_progress"]);
  redirect("/recruiter?cancelled=1");
}
