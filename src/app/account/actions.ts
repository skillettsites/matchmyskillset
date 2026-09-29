"use server";

// Job seeker account actions: ask for a sign-in link, use it, sign out,
// change consents, delete the saved CV, delete the account. Every action
// checks its own input and rate limit: Server Actions are reachable by direct
// POST.

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/email/results-email";
import { getStripe } from "@/lib/apis/stripe";
import { CONTACT_EMAIL } from "@/lib/site";
import { linkBase, requestIp } from "@/lib/employer/server";
import { notifyOwner } from "@/lib/employer/telegram";
import { sendCandidateSignInLink } from "@/lib/candidate/email";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { NOT_SWITCHED_ON } from "@/lib/candidate/plans";
import { claimGuestPacks, deleteAccount, deleteSavedCv, setConsents } from "@/lib/candidate/account";
import { isPlusAccount } from "@/lib/candidate/entitlements";
import { consumeLoginToken, createSession, destroySession, findOrCreateAccount, getCandidate, issueLoginToken, safeNext } from "@/lib/candidate/session";
import { claimTrackedForAccount, deleteTrackerDataForEmail, stopAllCheckins, trackedForAccount } from "@/lib/tracking/tracker";

export interface SignInState {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
}

export async function requestCandidateLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) return { status: "error", message: "Enter a valid email address." };

  const ip = await requestIp();
  const [byIp, byEmail] = await Promise.all([checkRateLimit(`cand-signin-ip:${ip}`, 10, 900), checkRateLimit(`cand-signin-email:${email}`, 5, 3600)]);
  if (!byIp.allowed || !byEmail.allowed) return { status: "error", message: "Too many sign-in emails. Please wait a few minutes and try again." };

  const next = safeNext(form.get("next"));
  let token: string;
  try {
    token = await issueLoginToken(email);
  } catch (err) {
    if (err instanceof NotSwitchedOnError) return { status: "error", message: NOT_SWITCHED_ON };
    console.error("[candidate-sign-in]", err instanceof Error ? err.message : err);
    return { status: "error", message: "Something went wrong on our side. Please try again in a minute." };
  }
  const url = `${await linkBase()}/account/sign-in/verify?token=${encodeURIComponent(token)}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  if (process.env.NODE_ENV !== "production") console.info(`[candidate-sign-in] dev sign-in link for ${email}: ${url}`);
  const sent = await sendCandidateSignInLink(email, url);
  if (!sent.ok) return { status: "error", message: `We could not send the email just now. Please try again, or email ${CONTACT_EMAIL}.` };
  return { status: "sent", email };
}

export async function completeCandidateSignIn(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const next = safeNext(form.get("next"));
  const { allowed } = await checkRateLimit(`cand-verify:${await requestIp()}`, 30, 900);
  if (!allowed) redirect("/account/sign-in?error=busy");

  let email: string | null;
  try {
    email = await consumeLoginToken(token);
    if (email) {
      const { account } = await findOrCreateAccount(email);
      await createSession(account.id);
      // Packs bought without an account, sent to this (now proven) email address.
      await claimGuestPacks(account.id, email);
      // Applications tracked as a guest with the same email (never throws).
      await claimTrackedForAccount(account.id, email);
    }
  } catch (err) {
    if (err instanceof NotSwitchedOnError) redirect("/account/sign-in?error=off");
    console.error("[candidate-sign-in] verify failed:", err instanceof Error ? err.message : err);
    redirect("/account/sign-in?error=failed");
  }
  if (!email) redirect("/account/sign-in?error=expired");
  redirect(next ?? "/account?welcome=1");
}

export async function signOutCandidate(): Promise<void> {
  await destroySession();
  redirect("/account/sign-in?signedout=1");
}

export async function updateCandidateSettings(form: FormData): Promise<void> {
  const account = await getCandidate();
  if (!account) redirect("/account/sign-in?next=/account");
  const tracking = form.get("tracking") === "on";
  try {
    await setConsents(account.id, { marketing: form.get("marketing") === "on", tracking }, account);
    // Tracking switched off: no more "did you hear back?" emails to this address.
    if (!tracking) {
      const rows = await trackedForAccount(account.id);
      const active = rows === "off" ? undefined : rows.find((r) => !r.checkins_stopped_at);
      if (active) await stopAllCheckins(active, "tracker");
    }
  } catch (err) {
    console.error("[account] settings failed:", err instanceof Error ? err.message : err);
    redirect("/account?saved=error#settings");
  }
  redirect("/account?saved=settings#settings");
}

export async function deleteCandidateSavedCv(): Promise<void> {
  const account = await getCandidate();
  if (!account) redirect("/account/sign-in?next=/account");
  try {
    await deleteSavedCv(account.id);
  } catch (err) {
    console.error("[account] saved CV delete failed:", err instanceof Error ? err.message : err);
    redirect("/account?saved=error#cv");
  }
  redirect("/account?saved=cv#cv");
}

export async function deleteCandidateAccount(form: FormData): Promise<void> {
  const account = await getCandidate();
  if (!account) redirect("/account/sign-in?next=/account");
  if (form.get("confirm") !== "on") redirect("/account?delete=confirm#delete");
  const { allowed } = await checkRateLimit(`cand-delete:${account.id}`, 5, 3600);
  if (!allowed) redirect("/account?delete=busy#delete");

  // Stop Plus first, so nobody is charged for an account that no longer exists.
  if (isPlusAccount(account) && account.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      if (!stripe) throw new Error("Stripe is not configured");
      await stripe.subscriptions.cancel(account.stripe_subscription_id, { prorate: false });
    } catch (err) {
      console.error("[account] Plus cancel failed before delete:", err instanceof Error ? err.message : err);
      await notifyOwner([`MatchMySkillset: an account delete is waiting on a Plus cancel`, `Subscription ${account.stripe_subscription_id}`]);
      redirect("/account?delete=plus#delete");
    }
  }
  try {
    await deleteAccount(account.id, form.get("results") === "on");
    await deleteTrackerDataForEmail(account.email);
  } catch (err) {
    console.error("[account] delete failed:", err instanceof Error ? err.message : err);
    redirect("/account?delete=error#delete");
  }
  await destroySession();
  redirect("/account/sign-in?deleted=1");
}
