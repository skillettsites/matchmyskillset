"use server";

// Public employer actions: ask for a sign-in link, use it, and send an
// enquiry (Enterprise, pay per hire or any question). Every action checks its
// own input and rate limit: Server Actions are reachable by direct POST.

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { isValidEmail } from "@/lib/email/results-email";
import { sendEnquiry, sendMagicLink } from "@/lib/employer/email";
import { notifyOwner } from "@/lib/employer/telegram";
import { JOBS_EMAIL } from "@/lib/employer/plans";
import { linkBase, requestIp } from "@/lib/employer/server";
import {
  consumeLoginToken,
  createSession,
  findOrCreateAccount,
  getEmployer,
  isSetUp,
  issueLoginToken,
} from "@/lib/employer/session";

/** Only paths inside the dashboard may be used as a "next" destination. */
function safeNext(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\/employers\/dashboard(\/[A-Za-z0-9/_?=&.-]*)?$/.test(value) ? value : null;
}

export interface SignInState {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
}

export async function requestSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) return { status: "error", message: "Enter a valid work email address." };

  const ip = await requestIp();
  const [byIp, byEmail] = await Promise.all([
    checkRateLimit(`emp-signin-ip:${ip}`, 10, 900),
    checkRateLimit(`emp-signin-email:${email}`, 5, 3600),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    return { status: "error", message: "Too many sign-in emails. Please wait a few minutes and try again." };
  }

  const next = safeNext(form.get("next"));
  let token: string;
  try {
    token = await issueLoginToken(email);
  } catch (err) {
    console.error("[employer-sign-in]", err instanceof Error ? err.message : err);
    return { status: "error", message: "Something went wrong on our side. Please try again in a minute." };
  }
  const url = `${await linkBase()}/employers/sign-in/verify?token=${encodeURIComponent(token)}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  if (process.env.NODE_ENV !== "production") console.info(`[employer-sign-in] dev sign-in link for ${email}: ${url}`);

  const sent = await sendMagicLink(email, url);
  if (!sent.ok) {
    return { status: "error", message: `We could not send the email just now. Please try again, or email ${JOBS_EMAIL}.` };
  }
  return { status: "sent", email };
}

export async function completeSignIn(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const next = safeNext(form.get("next"));

  const { allowed } = await checkRateLimit(`emp-verify:${await requestIp()}`, 30, 900);
  if (!allowed) redirect("/employers/sign-in?error=busy");

  const email = await consumeLoginToken(token);
  if (!email) redirect("/employers/sign-in?error=expired");

  const { account } = await findOrCreateAccount(email);
  await createSession(account.id);
  if (!isSetUp(account)) redirect(`/employers/dashboard/setup${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  redirect(next ?? "/employers/dashboard");
}

export interface EnquiryState {
  ok: boolean;
  message: string;
}

const INTERESTS = ["Enterprise", "Pay per hire", "Starter", "Growth", "Something else"];

export async function sendEnquiryAction(_prev: EnquiryState | null, form: FormData): Promise<EnquiryState> {
  // Bots fill every field; people never see this one.
  if (String(form.get("company_site") ?? "").trim()) return { ok: true, message: "Thanks, we have your message and will reply by email." };

  const { allowed } = await checkRateLimit(`emp-enquiry:${await requestIp()}`, 5, 3600);
  if (!allowed) return { ok: false, message: `Too many messages from here. Please email ${JOBS_EMAIL} instead.` };

  const name = cleanText(form.get("name"), 80);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const company = cleanText(form.get("company"), 120);
  const interestRaw = cleanText(form.get("interest"), 40);
  const interest = INTERESTS.includes(interestRaw) ? interestRaw : "Something else";
  const message = String(form.get("message") ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 2000);

  if (name.length < 2) return { ok: false, message: "Please add your name." };
  if (!isValidEmail(email)) return { ok: false, message: "Please add a valid email address so we can reply." };
  if (company.length < 2) return { ok: false, message: "Please add your company name." };

  const account = await getEmployer();
  const sent = await sendEnquiry({ name, email, company, interest, message, accountEmail: account?.email ?? null });
  // The alert names the company only; the enquirer's details are in the email to the jobs inbox.
  await notifyOwner([`MatchMySkillset employer enquiry: ${interest}`, company, `Details in the ${JOBS_EMAIL} inbox`]);
  if (!sent.ok) return { ok: false, message: `We could not send that just now. Please email ${JOBS_EMAIL} directly.` };
  return { ok: true, message: "Thanks, we have your message and will reply by email." };
}
