// Emails for candidate accounts and job packs, sent by Resend from
// jobs@matchmyskillset.com. Server code only. Each one is sent because the
// person asked for it (a sign-in link) or bought something (their pack link).
//
// Safety net for testing, as on the employer side: outside production every
// email goes to Resend's test inbox (delivered@resend.dev), and in production
// nothing is sent to reserved test domains (example.com and the like).

import { Resend } from "resend";
import { env } from "@/lib/env";
import { esc, isValidEmail } from "@/lib/email/results-email";
import { SITE_URL } from "@/components/site";
import { CONTACT_EMAIL } from "@/lib/site";
import { SIGN_IN_MINUTES } from "./plans";

const FROM = "MatchMySkillset <jobs@matchmyskillset.com>";
const TEST_INBOX = "delivered@resend.dev";
const TEST_DOMAIN = /@(example\.(com|org|net)|[^@]+\.(test|invalid|example))$/i;

let resend: Resend | null | undefined;
function client(): Resend | null {
  if (resend === undefined) {
    const key = env("RESEND_API_KEY");
    resend = key ? new Resend(key) : null;
  }
  return resend;
}

export interface MailResult {
  ok: boolean;
  id: string | null;
  error?: string;
}

async function send(opts: { to: string; subject: string; html: string; text: string }): Promise<MailResult> {
  const original = opts.to.trim();
  if (!isValidEmail(original)) return { ok: false, id: null, error: "invalid_recipient" };
  let to = original;
  if (process.env.NODE_ENV !== "production") {
    to = TEST_INBOX;
    console.info(`[candidate-email] dev: "${opts.subject}" for ${original} sent to ${TEST_INBOX}`);
  } else if (TEST_DOMAIN.test(original)) {
    console.info(`[candidate-email] skipped test address: "${opts.subject}"`);
    return { ok: true, id: null, error: "test_address_skipped" };
  }
  const r = client();
  if (!r) {
    console.warn("[candidate-email] RESEND_API_KEY is not set; email not sent");
    return { ok: false, id: null, error: "not_configured" };
  }
  try {
    const { data, error } = await r.emails.send({
      from: FROM,
      to,
      replyTo: CONTACT_EMAIL,
      subject: opts.subject.replace(/[\r\n\t]+/g, " ").trim().slice(0, 140),
      html: opts.html,
      text: opts.text,
    });
    if (error) {
      console.error("[candidate-email] Resend error:", error.name, error.message);
      return { ok: false, id: null, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[candidate-email] send failed:", err instanceof Error ? err.message : err);
    return { ok: false, id: null, error: "send_failed" };
  }
}

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;

function layout(title: string, body: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:${FONT};color:#1d1d1f;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:17px;font-weight:700;letter-spacing:-0.01em;margin:0 0 20px 0;color:#1d1d1f;">MatchMySkillset</p>
    <div style="background:#ffffff;border-radius:18px;padding:28px 26px;">
      ${body}
    </div>
    <p style="font-size:12px;line-height:1.55;color:#6e6e73;margin:18px 4px 0 4px;">
      ${esc(footer)}<br>
      <a href="${esc(`${SITE_URL}/privacy#cv-tools`)}" style="color:#6e6e73;">Privacy</a> &middot;
      <a href="${esc(`${SITE_URL}/terms#cv-tools`)}" style="color:#6e6e73;">Terms</a>
    </p>
  </div>
</body>
</html>`;
}

function h1(text: string): string {
  return `<h1 style="font-size:22px;line-height:1.2;letter-spacing:-0.02em;margin:0 0 12px 0;">${esc(text)}</h1>`;
}

function p(html: string, muted = false): string {
  return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:${muted ? "#6e6e73" : "#1d1d1f"};">${html}</p>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:22px 0;"><a href="${esc(href)}" style="display:inline-block;background:#0071e3;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:980px;">${esc(label)}</a></p>`;
}

export function sendCandidateSignInLink(to: string, url: string): Promise<MailResult> {
  const html = layout(
    "Sign in to MatchMySkillset",
    `${h1("Your sign-in link")}
     ${p(`Use this button to sign in to your MatchMySkillset account. It works once, within ${SIGN_IN_MINUTES} minutes.`)}
     ${button(url, "Sign in")}
     ${p("If you did not ask for this, you can ignore this email. Nobody can sign in without the link.", true)}`,
    "You are getting this one email because someone entered this address on the MatchMySkillset sign-in page."
  );
  const text = `Your MatchMySkillset sign-in link (works once, within ${SIGN_IN_MINUTES} minutes):\n\n${url}\n\nIf you did not ask for this, you can ignore this email.`;
  return send({ to, subject: "Your MatchMySkillset sign-in link", html, text });
}

export function sendPackReady(to: string, opts: { url: string; title: string; company: string; full: boolean; guest: boolean }): Promise<MailResult> {
  const what = opts.full ? "Your tailored CV, cover letter and interview prep" : "Your tailored CV";
  const verb = opts.full ? "are" : "is";
  const keep = opts.guest
    ? "This link is private to you and works for 12 months. Anyone with the link can open the pack, so keep it to yourself."
    : "It is also saved in your MatchMySkillset account.";
  const html = layout(
    `${what} ${verb} ready`,
    `${h1(`${what} for ${opts.title}`)}
     ${p(`Your job pack for <strong>${esc(opts.title)}</strong>${opts.company ? ` at ${esc(opts.company)}` : ""} is ready. Read it through, change anything you like, then approve it to download your CV as a Word file or PDF.`)}
     ${button(opts.url, "Open your job pack")}
     ${p(esc(keep), true)}
     ${p(`Questions or a problem with your pack? Reply to this email or write to ${esc(CONTACT_EMAIL)}.`, true)}`,
    "You are getting this because you asked MatchMySkillset to write a job pack."
  );
  const text = `${what} for ${opts.title}${opts.company ? ` at ${opts.company}` : ""} ${verb} ready.\n\nOpen your job pack: ${opts.url}\n\n${keep}\n\nQuestions? Write to ${CONTACT_EMAIL}.`;
  return send({ to, subject: `${what} for ${opts.title}`, html, text });
}
