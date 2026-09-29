"use server";

// Signed-in employer actions. Each one re-checks the session and that the
// job, application or candidate belongs to (or is visible to) this account:
// Server Actions can be called by direct POST, not only from our forms.

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanHttpUrl, cleanText } from "@/lib/input";
import { SITE_URL } from "@/components/site";
import { sendContactRequestToCandidate } from "@/lib/employer/email";
import { notifyOwner } from "@/lib/employer/telegram";
import { effectivePlan, hasRecruiterShortlist, JOBS_EMAIL, PLAN_NAMES } from "@/lib/employer/plans";
import { destroySession, requireEmployer } from "@/lib/employer/session";
import { isMissingColumn, isUuid, linkBase, randomToken } from "@/lib/employer/server";
import { hasCompanyPage, uniqueSlug } from "@/lib/employer/company";
import { contactDisplayStatus } from "@/lib/employer/candidates";
import { deriveJobFields, getAccountJob, invalidatePublicJobs, isExpired, listingBlocker, listingExpiry, readJobForm } from "@/lib/employer/jobs";
import { getJobShortlist, isShortlistSchemaMissing, openShortlistRequest, setShortlistWanted } from "@/lib/employer/shortlists";

function website(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return cleanHttpUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`, 300);
}

function safeNext(value: unknown): string | null {
  return typeof value === "string" && /^\/employers\/dashboard(\/[A-Za-z0-9/_?=&.-]*)?$/.test(value) ? value : null;
}

/* ---------- Account ---------- */

export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function completeSetup(_prev: FormState, form: FormData): Promise<FormState> {
  const account = await requireEmployer({ allowIncomplete: true });
  const company = cleanText(form.get("company_name"), 120);
  const contact = cleanText(form.get("contact_name"), 80);
  const rawSite = String(form.get("website") ?? "").trim();
  const site = website(rawSite);
  const errors: Record<string, string> = {};
  if (company.length < 2) errors.company_name = "Add your company or organisation name.";
  if (contact.length < 2) errors.contact_name = "Add your name.";
  if (rawSite && !site) errors.website = "That does not look like a web address.";
  if (form.get("terms") !== "on") errors.terms = "Please accept the employer terms to continue.";
  if (Object.keys(errors).length) return { errors, message: "Please check the highlighted fields." };

  const firstTime = !account.terms_accepted_at;
  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("mms_employer_accounts")
    .update({ company_name: company, contact_name: contact, website: site, terms_accepted_at: account.terms_accepted_at ?? now, updated_at: now })
    .eq("id", account.id);
  if (error) return { message: "We could not save that just now. Please try again." };

  if (firstTime) {
    await notifyOwner(
      ["New MatchMySkillset employer sign-up", company, site ? `Website: ${site}` : "No website given", "Contact details in admin"],
      [{ text: "Open admin", url: `${SITE_URL}/admin#employers` }]
    );
  }
  redirect(safeNext(form.get("next")) ?? "/employers/dashboard?welcome=1");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/employers/sign-in");
}

export async function saveAccountDetails(_prev: FormState, form: FormData): Promise<FormState> {
  const account = await requireEmployer();
  const company = cleanText(form.get("company_name"), 120);
  const contact = cleanText(form.get("contact_name"), 80);
  const rawSite = String(form.get("website") ?? "").trim();
  const site = website(rawSite);
  const errors: Record<string, string> = {};
  if (company.length < 2) errors.company_name = "Add your company name.";
  if (contact.length < 2) errors.contact_name = "Add your name.";
  if (rawSite && !site) errors.website = "That does not look like a web address.";
  if (Object.keys(errors).length) return { errors, message: "Please check the highlighted fields." };
  const { error } = await createAdminClient()
    .from("mms_employer_accounts")
    .update({ company_name: company, contact_name: contact, website: site, updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (error) return { message: "We could not save that just now. Please try again." };
  refresh();
  return { ok: true, message: "Saved. New jobs will use this company name." };
}

export async function saveCompanyPage(_prev: FormState, form: FormData): Promise<FormState> {
  const account = await requireEmployer();
  if (!hasCompanyPage(account)) return { message: "Company pages come with the Growth and Enterprise plans." };
  if (!account.company_name) return { message: "Add your company name first." };
  const description = String(form.get("company_description") ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2000);
  if (description.length < 40) return { errors: { company_description: "Write at least a couple of sentences about your company." } };

  const { slug, missingColumn } = account.slug ? { slug: account.slug, missingColumn: false } : await uniqueSlug(account.id, account.company_name);
  if (missingColumn || !slug) {
    return { message: `Company pages are not switched on yet. Please try again later, or email ${JOBS_EMAIL}.` };
  }
  const { error } = await createAdminClient()
    .from("mms_employer_accounts")
    .update({ slug, company_description: description, updated_at: new Date().toISOString() })
    .eq("id", account.id);
  if (error) {
    if (isMissingColumn(error)) return { message: `Company pages are not switched on yet. Please try again later, or email ${JOBS_EMAIL}.` };
    return { message: "We could not save that just now. Please try again." };
  }
  refresh();
  return { ok: true, message: "Saved. Your company page is live." };
}

/* ---------- Jobs ---------- */

export interface JobFormState {
  errors: Record<string, string>;
  message?: string;
}

export async function saveJob(_prev: JobFormState, form: FormData): Promise<JobFormState> {
  const account = await requireEmployer();
  const { allowed } = await checkRateLimit(`emp-job:${account.id}`, 60, 3600);
  if (!allowed) return { errors: {}, message: "You have saved a lot of changes in the last hour. Please try again shortly." };

  const idRaw = String(form.get("id") ?? "");
  const id = isUuid(idRaw) ? idRaw : null;
  const submit = form.get("intent") === "submit";
  const { input, errors } = readJobForm(form);
  if (Object.keys(errors).length) return { errors, message: "Please check the highlighted fields." };

  const existing = id ? await getAccountJob(account.id, id) : null;
  if (id && !existing) return { errors: {}, message: "That job was not found." };

  let status: "draft" | "pending" = submit ? "pending" : "draft";
  let notice = submit ? "submitted" : "draft";
  if (submit) {
    const blocker = await listingBlocker(account, id ?? undefined);
    if (blocker) {
      // Never lose what they typed: keep a new job or a draft as a draft.
      if (existing && existing.status !== "draft") return { errors: {}, message: blocker };
      status = "draft";
      notice = "blocked";
    }
  }

  const derived = await deriveJobFields(input);
  const now = new Date().toISOString();
  const row = { ...input, ...derived, company_name: account.company_name ?? "", status, updated_at: now };
  // The "Send me a recruiter shortlist" box is only on the form for Growth and Enterprise; otherwise leave the saved choice alone.
  const shortlistOffered = form.get("shortlist_offered") === "1" && hasRecruiterShortlist(effectivePlan(account));
  const wanted = form.get("shortlist") === "on";
  const withShortlist = shortlistOffered ? { ...row, shortlist_wanted: wanted } : row;
  let shortlistOff = false;
  const admin = createAdminClient();
  let jobId = id;
  if (existing) {
    let { error } = await admin.from("mms_jobs").update(withShortlist).eq("id", existing.id).eq("account_id", account.id);
    if (error && shortlistOffered && isShortlistSchemaMissing(error)) {
      // Migration 008 is not applied yet: save the job without the shortlist choice.
      shortlistOff = wanted;
      ({ error } = await admin.from("mms_jobs").update(row).eq("id", existing.id).eq("account_id", account.id));
    }
    if (error) return { errors: {}, message: "We could not save the job just now. Please try again." };
  } else {
    let { data, error } = await admin.from("mms_jobs").insert({ ...withShortlist, account_id: account.id }).select("id").single();
    if (error && shortlistOffered && isShortlistSchemaMissing(error)) {
      shortlistOff = wanted;
      ({ data, error } = await admin.from("mms_jobs").insert({ ...row, account_id: account.id }).select("id").single());
    }
    if (error || !data) return { errors: {}, message: "We could not save the job just now. Please try again." };
    jobId = data.id as string;
  }
  // A live job that was edited leaves the site until it is approved again.
  if (existing?.status === "live") invalidatePublicJobs();

  if (status === "pending") {
    await notifyOwner(
      [
        "MatchMySkillset job waiting for approval",
        `${input.title} at ${account.company_name}`,
        `${input.remote === "remote" ? "Remote" : input.location} · ${PLAN_NAMES[effectivePlan(account) ?? "starter"]} plan`,
        existing ? "Edited and resubmitted" : "New job",
      ],
      [{ text: "Review in admin", url: `${SITE_URL}/admin#pending` }]
    );
  }
  redirect(`/employers/dashboard/jobs/${jobId}?notice=${notice}${shortlistOff ? "&shortlist=off" : ""}`);
}

export async function jobCommand(form: FormData): Promise<void> {
  const account = await requireEmployer();
  const id = String(form.get("id") ?? "");
  const op = String(form.get("op") ?? "");
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) redirect("/employers/dashboard?notice=missing");
  const admin = createAdminClient();
  const back = (notice: string) => redirect(`/employers/dashboard/jobs/${job.id}?notice=${notice}`);
  const now = new Date().toISOString();

  if (op === "close" && (job.status === "live" || job.status === "pending")) {
    await admin.from("mms_jobs").update({ status: "closed", updated_at: now }).eq("id", job.id);
    invalidatePublicJobs();
    back("closed");
  }
  if (op === "renew" && job.status === "live") {
    const blocker = await listingBlocker(account, job.id, false);
    if (blocker) back("limit");
    await admin.from("mms_jobs").update({ expires_at: listingExpiry(), updated_at: now }).eq("id", job.id);
    invalidatePublicJobs();
    back("renewed");
  }
  if (op === "submit" && (job.status === "draft" || job.status === "closed" || job.status === "rejected")) {
    const blocker = await listingBlocker(account, job.id);
    if (blocker) back("limit");
    await admin.from("mms_jobs").update({ status: "pending", updated_at: now }).eq("id", job.id);
    await notifyOwner(
      ["MatchMySkillset job waiting for approval", `${job.title} at ${job.company_name}`, job.status === "closed" ? "Reopened" : "Submitted"],
      [{ text: "Review in admin", url: `${SITE_URL}/admin#pending` }]
    );
    back("submitted");
  }
  if (op === "delete" && (job.status === "draft" || job.status === "rejected")) {
    await admin.from("mms_jobs").delete().eq("id", job.id).eq("account_id", account.id);
    redirect("/employers/dashboard?notice=deleted");
  }
  if (op === "shortlist") {
    // Ask for a recruiter shortlist after posting (Growth and Enterprise, one per job).
    if (!hasRecruiterShortlist(effectivePlan(account))) back("shortlist-plan");
    if (job.status === "closed" || isExpired(job)) back("shortlist-closed");
    if (job.status === "live") {
      const opened = await openShortlistRequest(job, account);
      if (opened === "off") back("shortlist-off");
      if (opened === "error") back("shortlist-error");
      if (opened === "exists") back("shortlist-exists");
      await setShortlistWanted(job.id, true);
      back("shortlist-requested");
    }
    // Not live yet: remember the choice; the request opens when the job is approved.
    const { ready, shortlist } = await getJobShortlist(job.id);
    if (!ready) back("shortlist-off");
    if (shortlist && shortlist.status !== "cancelled") back("shortlist-exists");
    if (!(await setShortlistWanted(job.id, true))) back("shortlist-off");
    back("shortlist-queued");
  }
  back("unchanged");
}

/* ---------- Applicants ---------- */

async function ownApplication(accountId: string, appId: string): Promise<{ id: string; job_id: string; status: string } | null> {
  if (!isUuid(appId)) return null;
  const { data } = await createAdminClient().from("mms_applications").select("id, job_id, status").eq("id", appId).maybeSingle();
  if (!data) return null;
  const job = await getAccountJob(accountId, data.job_id);
  return job ? data : null;
}

export async function setApplicationStatus(form: FormData): Promise<void> {
  const account = await requireEmployer();
  const status = String(form.get("status") ?? "");
  if (!["new", "viewed", "shortlisted", "rejected"].includes(status)) return;
  const app = await ownApplication(account.id, String(form.get("id") ?? ""));
  if (!app) return;
  await createAdminClient().from("mms_applications").update({ status }).eq("id", app.id);
  refresh();
}

export async function markApplicationViewed(appId: string): Promise<void> {
  const account = await requireEmployer();
  const app = await ownApplication(account.id, appId);
  if (!app || app.status !== "new") return;
  await createAdminClient().from("mms_applications").update({ status: "viewed" }).eq("id", app.id).eq("status", "new");
}

/* ---------- Contact requests ---------- */

export interface ContactState {
  ok: boolean;
  message: string;
}

export async function requestContact(_prev: ContactState | null, form: FormData): Promise<ContactState> {
  const account = await requireEmployer();
  if (!effectivePlan(account)) return { ok: false, message: "You need an active plan to contact candidates." };
  const candidateId = String(form.get("candidate_id") ?? "");
  const jobIdRaw = String(form.get("job_id") ?? "");
  if (!isUuid(candidateId)) return { ok: false, message: "That candidate was not found." };

  const { allowed } = await checkRateLimit(`emp-contact:${account.id}`, 30, 86_400);
  if (!allowed) return { ok: false, message: "You have sent the most contact requests allowed in a day. Please try again tomorrow." };

  const job = isUuid(jobIdRaw) ? await getAccountJob(account.id, jobIdRaw) : null;
  const message = String(form.get("message") ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, " ")
    .trim()
    .slice(0, 1000);

  const admin = createAdminClient();
  const cand = await admin
    .from("mms_candidates")
    .select("id, email, discoverable, withdrawn_at, expires_at, manage_token")
    .eq("id", candidateId)
    .maybeSingle();
  const c = cand.data;
  if (!c || !c.discoverable || c.withdrawn_at || (c.expires_at && new Date(c.expires_at).getTime() < Date.now())) {
    return { ok: false, message: "This person is no longer available to contact." };
  }

  const previous = await admin
    .from("mms_contact_requests")
    .select("status, created_at")
    .eq("account_id", account.id)
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1);
  const last = previous.data?.[0];
  if (last) {
    const status = contactDisplayStatus(last);
    if (status === "pending") return { ok: false, message: "You have already asked this person. We will show their answer here." };
    if (status === "accepted") return { ok: false, message: "This person has already accepted. Their details are under Contact requests." };
    if (status === "declined") return { ok: false, message: "This person declined an earlier request from you, so we will not ask again." };
  }

  const token = randomToken();
  const inserted = await admin
    .from("mms_contact_requests")
    .insert({ account_id: account.id, candidate_id: candidateId, job_id: job?.id ?? null, message: message || null, response_token: token })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) return { ok: false, message: "We could not send the request just now. Please try again." };

  const base = await linkBase();
  const sent = await sendContactRequestToCandidate(c.email, {
    company: account.company_name ?? "An employer",
    jobTitle: job?.title ?? null,
    message: message || null,
    respondUrl: `${base}/contact/${encodeURIComponent(token)}`,
    manageUrl: c.manage_token ? `${base}/me/${encodeURIComponent(c.manage_token)}` : null,
  });
  if (!sent.ok) {
    await admin.from("mms_contact_requests").delete().eq("id", inserted.data.id);
    return { ok: false, message: "We could not email this person just now. Please try again later." };
  }
  refresh();
  return { ok: true, message: "Request sent. We have emailed them and will show their answer under Contact requests." };
}
