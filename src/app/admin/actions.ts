"use server";

// Admin actions for Dave. Every action checks the admin cookie itself.

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { checkAdminPassword, endAdminSession, isAdmin, startAdminSession } from "@/lib/employer/admin-auth";
import { sendJobApproved, sendJobRejected } from "@/lib/employer/email";
import { formatDate, invalidatePublicJobs, listingBlocker, listingExpiry, setReviewNote } from "@/lib/employer/jobs";
import { isPlanId, isPlanStatus } from "@/lib/employer/plans";
import { isUuid, linkBase, requestIp } from "@/lib/employer/server";
import type { EmployerAccount, JobRow } from "@/lib/employer/types";

export interface AdminLoginState {
  error?: string;
}

export async function adminSignIn(_prev: AdminLoginState, form: FormData): Promise<AdminLoginState> {
  const { allowed } = await checkRateLimit(`admin-login:${await requestIp()}`, 10, 900);
  if (!allowed) return { error: "Too many attempts. Try again in 15 minutes." };
  if (!checkAdminPassword(String(form.get("password") ?? ""))) return { error: "That password is not right." };
  await startAdminSession();
  redirect("/admin");
}

export async function adminSignOut(): Promise<void> {
  await endAdminSession();
  redirect("/admin");
}

async function guard(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
}

function back(query: string, anchor: string): never {
  redirect(`/admin?${query}#${anchor}`);
}

async function loadJob(id: string): Promise<{ job: JobRow; account: EmployerAccount | null } | null> {
  if (!isUuid(id)) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("mms_jobs").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const job = data as JobRow;
  const acc = job.account_id ? await admin.from("mms_employer_accounts").select("*").eq("id", job.account_id).maybeSingle() : null;
  return { job, account: (acc?.data as EmployerAccount) ?? null };
}

export async function approveJob(form: FormData): Promise<void> {
  await guard();
  const found = await loadJob(String(form.get("id") ?? ""));
  if (!found || found.job.status !== "pending") back("err=That job is no longer waiting for approval.", "pending");
  const { job, account } = found;
  if (!account) back("err=That job has no employer account.", "pending");
  const blocker = await listingBlocker(account, job.id, false);
  if (blocker) back(`err=${encodeURIComponent(`Not approved: ${account.email} ${blocker} Set their plan below first.`)}`, "pending");

  const now = new Date();
  const expires = listingExpiry(now.getTime());
  const { error } = await createAdminClient()
    .from("mms_jobs")
    .update({ status: "live", approved_at: now.toISOString(), expires_at: expires, updated_at: now.toISOString() })
    .eq("id", job.id)
    .eq("status", "pending");
  if (error) back(`err=${encodeURIComponent(error.message)}`, "pending");
  await setReviewNote(job.id, null);
  invalidatePublicJobs();
  const sent = await sendJobApproved(account.email, {
    jobTitle: job.title,
    expires: formatDate(expires),
    url: `${await linkBase()}/employers/dashboard/jobs/${job.id}`,
  });
  back(`msg=${encodeURIComponent(`Approved "${job.title}"${sent.ok ? " and emailed the employer" : ", but the email failed"}.`)}`, "pending");
}

export async function rejectJob(form: FormData): Promise<void> {
  await guard();
  const reason = String(form.get("reason") ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, 1500);
  const found = await loadJob(String(form.get("id") ?? ""));
  if (!found || found.job.status !== "pending") back("err=That job is no longer waiting for approval.", "pending");
  if (reason.length < 5) back("err=Give the employer a reason so they can fix it.", "pending");
  const { job, account } = found;
  const { error } = await createAdminClient()
    .from("mms_jobs")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "pending");
  if (error) back(`err=${encodeURIComponent(error.message)}`, "pending");
  await setReviewNote(job.id, reason);
  const sent = account
    ? await sendJobRejected(account.email, { jobTitle: job.title, reason, url: `${await linkBase()}/employers/dashboard/jobs/${job.id}/edit` })
    : { ok: false };
  back(`msg=${encodeURIComponent(`Sent back "${job.title}"${sent.ok ? " and emailed the reason" : ", but the email failed"}.`)}`, "pending");
}

export async function adminCloseJob(form: FormData): Promise<void> {
  await guard();
  const found = await loadJob(String(form.get("id") ?? ""));
  if (!found) back("err=Job not found.", "live");
  await createAdminClient().from("mms_jobs").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", found.job.id);
  invalidatePublicJobs();
  back(`msg=${encodeURIComponent(`Closed "${found.job.title}".`)}`, "live");
}

export async function updateEmployer(form: FormData): Promise<void> {
  await guard();
  const id = String(form.get("id") ?? "");
  if (!isUuid(id)) back("err=Employer not found.", "employers");
  const planRaw = String(form.get("plan") ?? "none");
  const plan = planRaw === "none" || isPlanId(planRaw) ? planRaw : null;
  const status = String(form.get("plan_status") ?? "");
  const notes = String(form.get("notes") ?? "").trim().slice(0, 2000);
  if (!plan || !isPlanStatus(status)) back("err=Pick a valid plan and status.", "employers");
  if (plan === "none" && (status === "active" || status === "comped")) back("err=An active or comped account needs a plan.", "employers");
  const { error } = await createAdminClient()
    .from("mms_employer_accounts")
    .update({ plan, plan_status: status, notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) back(`err=${encodeURIComponent(error.message)}`, "employers");
  back(`msg=${encodeURIComponent(`Saved ${cleanText(form.get("label"), 120) || "employer"}.`)}`, "employers");
}
