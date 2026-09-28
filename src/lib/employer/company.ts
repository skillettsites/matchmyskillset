// Company pages (/companies/[slug]) for Growth and Enterprise accounts.
// Needs the slug and company_description columns from migration 007.

import { createAdminClient } from "@/lib/supabase/admin";
import { effectivePlan, limitsFor } from "./plans";
import { isMissingColumn } from "./server";
import type { EmployerAccount, JobRow } from "./types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Initials for the text logo tile (no uploaded logos, so nothing can be faked). */
export function initials(name: string): string {
  const words = name
    .replace(/\b(ltd|limited|plc|llp|inc|the)\b\.?/gi, " ")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const letters = (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? name).slice(0, 2)).toUpperCase();
  return letters || "?";
}

export function hasCompanyPage(account: Pick<EmployerAccount, "plan" | "plan_status">): boolean {
  return Boolean(limitsFor(effectivePlan(account))?.companyPage);
}

/** A slug for this account's company that no other account uses. */
export async function uniqueSlug(accountId: string, companyName: string): Promise<{ slug: string | null; missingColumn: boolean }> {
  const base = slugify(companyName) || "company";
  const admin = createAdminClient();
  for (let n = 1; n <= 20; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { data, error } = await admin.from("mms_employer_accounts").select("id").eq("slug", candidate).neq("id", accountId).limit(1);
    if (error) return { slug: null, missingColumn: isMissingColumn(error) };
    if (!data || data.length === 0) return { slug: candidate, missingColumn: false };
  }
  return { slug: `${base}-${accountId.slice(0, 8)}`, missingColumn: false };
}

export interface CompanyPageData {
  account: EmployerAccount;
  jobs: JobRow[];
}

/** The public company page, or null when there is none (no such slug, plan lapsed, or 007 not applied). */
export async function getCompanyPage(slug: string): Promise<CompanyPageData | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.from("mms_employer_accounts").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const account = data as EmployerAccount;
  if (!hasCompanyPage(account) || !account.company_name) return null;
  const now = new Date().toISOString();
  const jobs = await admin
    .from("mms_jobs")
    .select("*")
    .eq("account_id", account.id)
    .eq("status", "live")
    .gt("expires_at", now)
    .order("approved_at", { ascending: false })
    .limit(100);
  return { account, jobs: (jobs.data as JobRow[]) ?? [] };
}
