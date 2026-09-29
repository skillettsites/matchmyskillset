"use server";

// Admin actions for partner rates and placements (migration 010). Kept apart
// from ./actions.ts so the admin page's other actions are untouched. Every
// action checks the admin cookie itself.

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/input";
import { isValidEmail } from "@/lib/email/results-email";
import { isAdmin } from "@/lib/employer/admin-auth";
import { isUuid } from "@/lib/employer/server";
import { formatPence, isSelfServePlan, PLAN_NAMES, SELF_SERVE_PRICES } from "@/lib/employer/plans";
import { isTrackingSchemaMissing } from "@/lib/tracking/db";
import { fieldOfTitle, isFieldId } from "@/lib/tracking/field";
import { recordPlacement, setPlacementCancelled } from "@/lib/tracking/placements";

async function guard(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
}

function backToEmployers(query: string): never {
  redirect(`/admin?${query}#employers`);
}

function backToFunnel(query: string, keep: FormDataEntryValue | null): never {
  const q = typeof keep === "string" && /^[A-Za-z0-9=&%._-]*$/.test(keep) ? keep : "";
  redirect(`/admin/funnel?${[q, query].filter(Boolean).join("&")}#placements`);
}

/**
 * Sets or clears a partner rate: a monthly price in pence for one self-serve
 * plan. Checkout for that account then charges this price for that plan.
 */
export async function setPartnerRate(form: FormData): Promise<void> {
  await guard();
  const id = String(form.get("id") ?? "");
  if (!isUuid(id)) backToEmployers("err=Employer not found.");
  const label = cleanText(form.get("label"), 120) || "employer";
  const now = new Date().toISOString();
  const admin = createAdminClient();

  if (form.get("clear") === "1") {
    const { error } = await admin.from("mms_employer_accounts").update({ partner_plan: null, partner_price_pence: null, partner_set_at: now, updated_at: now }).eq("id", id);
    if (error) backToEmployers(`err=${encodeURIComponent(isTrackingSchemaMissing(error) ? "Partner rates are not switched on yet: apply supabase/migrations/010_tracking.sql." : error.message)}`);
    backToEmployers(`msg=${encodeURIComponent(`Removed the partner rate for ${label}.`)}`);
  }

  const plan = String(form.get("partner_plan") ?? "");
  const pence = Number.parseInt(String(form.get("partner_price_pence") ?? ""), 10);
  if (!isSelfServePlan(plan)) backToEmployers("err=Pick Lite, Starter or Growth for the partner rate.");
  if (!Number.isInteger(pence) || pence < 100 || pence > SELF_SERVE_PRICES[plan]) {
    backToEmployers(`err=${encodeURIComponent(`Enter a monthly price in pence from 100 to ${SELF_SERVE_PRICES[plan]} (the standard ${PLAN_NAMES[plan]} price).`)}`);
  }
  const { error } = await admin.from("mms_employer_accounts").update({ partner_plan: plan, partner_price_pence: pence, partner_set_at: now, updated_at: now }).eq("id", id);
  if (error) backToEmployers(`err=${encodeURIComponent(isTrackingSchemaMissing(error) ? "Partner rates are not switched on yet: apply supabase/migrations/010_tracking.sql." : error.message)}`);
  backToEmployers(`msg=${encodeURIComponent(`Partner rate for ${label}: ${PLAN_NAMES[plan]} at ${formatPence(pence)} a month. It applies from their next checkout.`)}`);
}

/**
 * Records a placement by hand: linked to an application made through us or a
 * tracked application (by id), or free-standing with the job details typed in.
 */
export async function recordAdminPlacement(form: FormData): Promise<void> {
  await guard();
  const keep = form.get("keep");
  const link = String(form.get("link") ?? "").trim();
  const jobTitle = cleanText(form.get("job_title"), 200);
  const company = cleanText(form.get("company"), 200);
  const location = cleanText(form.get("location"), 200);
  const fieldRaw = String(form.get("field") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const startedRaw = String(form.get("started_on") ?? "");
  const note = String(form.get("note") ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 1000);
  const employerRaw = String(form.get("employer") ?? "");
  const startedOn = /^\d{4}-\d{2}-\d{2}$/.test(startedRaw) ? startedRaw : null;
  if (email && !isValidEmail(email)) backToFunnel("err=That email address does not look right.", keep);

  const admin = createAdminClient();
  let input: Parameters<typeof recordPlacement>[0] = {
    source: "admin",
    jobTitle: jobTitle || null,
    company: company || null,
    location: location || null,
    field: isFieldId(fieldRaw) ? fieldRaw : null,
    email: email || null,
    employerAccountId: isUuid(employerRaw) ? employerRaw : null,
    startedOn,
    adminNote: note || null,
  };

  const [kind, id] = link.split(":");
  if (link && (!isUuid(id) || (kind !== "app" && kind !== "trk"))) backToFunnel("err=The link must look like app:<application id> or trk:<tracked id>.", keep);
  if (kind === "app" && isUuid(id)) {
    const { data } = await admin.from("mms_applications").select("id, email, candidate_id, job_id, mms_jobs(id, title, company_name, location, soc_code, account_id)").eq("id", id).maybeSingle();
    if (!data) backToFunnel("err=No application with that id.", keep);
    const job = (data as unknown as { mms_jobs: { id: string; title: string; company_name: string; location: string | null; soc_code: string | null; account_id: string | null } | null }).mms_jobs;
    input = {
      ...input,
      applicationId: data.id as string,
      jobId: job?.id ?? (data.job_id as string),
      employerAccountId: job?.account_id ?? input.employerAccountId,
      email: input.email ?? (data.email as string),
      candidateId: (data.candidate_id as string | null) ?? null,
      jobTitle: input.jobTitle ?? job?.title ?? null,
      company: input.company ?? job?.company_name ?? null,
      location: input.location ?? job?.location ?? null,
      socCode: job?.soc_code ?? null,
      channel: "mms",
    };
  } else if (kind === "trk" && isUuid(id)) {
    const { data, error } = await admin
      .from("mms_tracked_applications")
      .select("id, email, application_id, job_id, employer_account_id, candidate_id, account_id, job_title, company, job_location, field, soc_code, source")
      .eq("id", id)
      .maybeSingle();
    if (error && isTrackingSchemaMissing(error)) backToFunnel("err=Tracking is not switched on yet: apply supabase/migrations/010_tracking.sql.", keep);
    if (!data) backToFunnel("err=No tracked application with that id.", keep);
    input = {
      ...input,
      trackedId: data.id as string,
      applicationId: (data.application_id as string | null) ?? null,
      jobId: (data.job_id as string | null) ?? null,
      employerAccountId: (data.employer_account_id as string | null) ?? input.employerAccountId,
      email: input.email ?? (data.email as string),
      candidateId: (data.candidate_id as string | null) ?? null,
      candidateAccountId: (data.account_id as string | null) ?? null,
      jobTitle: input.jobTitle ?? (data.job_title as string),
      company: input.company ?? (data.company as string | null),
      location: input.location ?? (data.job_location as string | null),
      field: input.field ?? (data.field as string | null),
      socCode: (data.soc_code as string | null) ?? null,
      channel: data.source as "mms" | "external",
    };
  } else if (!jobTitle) {
    backToFunnel("err=Give the job title (or link an application).", keep);
  }
  if (!input.field && input.jobTitle) input.field = fieldOfTitle(input.jobTitle);

  const r = await recordPlacement(input).catch((err: unknown) => {
    console.error("[admin] placement failed:", err instanceof Error ? err.message : err);
    return null;
  });
  if (r === "off") backToFunnel("err=Placements are not switched on yet: apply supabase/migrations/010_tracking.sql.", keep);
  if (!r) backToFunnel("err=Could not record the placement. Check the logs.", keep);
  backToFunnel(`msg=${encodeURIComponent(r.created ? `Recorded a placement: ${r.placement.job_title ?? "job"}.` : `Added your confirmation to the existing placement for ${r.placement.job_title ?? "that job"}.`)}`, keep);
}

export async function togglePlacementCancelled(form: FormData): Promise<void> {
  await guard();
  const keep = form.get("keep");
  const id = String(form.get("id") ?? "");
  const cancel = form.get("cancel") === "1";
  if (!isUuid(id)) backToFunnel("err=Placement not found.", keep);
  const ok = await setPlacementCancelled(id, cancel);
  backToFunnel(ok ? `msg=${cancel ? "Placement cancelled." : "Placement restored."}` : "err=Could not change that placement.", keep);
}
