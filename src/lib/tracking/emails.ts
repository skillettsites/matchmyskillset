// Tracking emails to job seekers, from "MatchMySkillset <jobs@matchmyskillset.com>"
// through Resend. Server code only. Everything that came from a person or a
// job board (job titles, company names) is HTML-escaped.
//
// Safety net, as for employer mail: outside production every email goes to
// Resend's test inbox (delivered@resend.dev) instead of the real address, and
// in production nothing is sent to reserved test domains (example.com etc).
//
// Check-in emails carry List-Unsubscribe (one-click, RFC 8058) pointing at
// /api/tracker/unsubscribe, which stops every check-in to the address.

import { Resend } from "resend";
import { env } from "@/lib/env";
import { esc, isValidEmail } from "@/lib/email/results-email";
import { JOBS_EMAIL } from "@/lib/employer/plans";
import { CHECKIN_ANSWER_LABELS, type CheckinAnswer } from "./constants";

const FROM = `MatchMySkillset <${JOBS_EMAIL}>`;
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
  /** Nothing was sent on purpose (a test address in production). */
  skipped?: boolean;
  error?: string;
}

function subjectSafe(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

async function send(opts: { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }): Promise<MailResult> {
  const original = opts.to.trim();
  if (!isValidEmail(original)) return { ok: false, id: null, error: "invalid_recipient" };
  let to = original;
  if (process.env.NODE_ENV !== "production") {
    to = /@resend\.dev$/i.test(original) ? original : TEST_INBOX;
    console.info(`[tracking-email] dev: "${opts.subject}" sent to ${to}`);
  } else if (TEST_DOMAIN.test(original)) {
    console.info(`[tracking-email] skipped test address: "${opts.subject}"`);
    return { ok: true, id: null, skipped: true };
  }
  const r = client();
  if (!r) {
    console.warn("[tracking-email] RESEND_API_KEY is not set; email not sent");
    return { ok: false, id: null, error: "not_configured" };
  }
  try {
    const { data, error } = await r.emails.send({
      from: FROM,
      to,
      replyTo: JOBS_EMAIL,
      subject: subjectSafe(opts.subject),
      html: opts.html,
      text: opts.text,
      ...(opts.headers ? { headers: opts.headers } : {}),
    });
    if (error) {
      console.error("[tracking-email] Resend error:", error.name, error.message);
      return { ok: false, id: null, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[tracking-email] send failed:", err instanceof Error ? err.message : err);
    return { ok: false, id: null, error: "send_failed" };
  }
}

// ---------------------------------------------------------------------------
// Layout (the same look as the other MatchMySkillset emails)
// ---------------------------------------------------------------------------

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;
const INK = "#1d1d1f";
const MUTE = "#6e6e73";
const BLUE = "#0071e3";

function layout(opts: { title: string; body: string; footer: string; base: string }): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:${FONT};color:${INK};">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:17px;font-weight:700;letter-spacing:-0.01em;margin:0 0 20px 0;color:${INK};">MatchMySkillset</p>
    <div style="background:#ffffff;border-radius:18px;padding:28px 26px;">
      ${opts.body}
    </div>
    <p style="font-size:12px;line-height:1.55;color:${MUTE};margin:18px 4px 0 4px;">
      ${opts.footer}<br>
      <a href="${esc(`${opts.base}/privacy#tracking`)}" style="color:${MUTE};">Privacy</a> &middot;
      <a href="${esc(`${opts.base}/terms`)}" style="color:${MUTE};">Terms</a>
    </p>
  </div>
</body>
</html>`;
}

function h1(text: string): string {
  return `<h1 style="font-size:22px;line-height:1.25;letter-spacing:-0.02em;margin:0 0 12px 0;">${esc(text)}</h1>`;
}

function p(html: string, muted = false): string {
  return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:${muted ? MUTE : INK};">${html}</p>`;
}

function button(href: string, label: string, primary = true): string {
  const style = primary
    ? `display:inline-block;background:${BLUE};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:980px;`
    : `display:inline-block;background:#f5f5f7;color:${INK};font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:980px;`;
  return `<a href="${esc(href)}" style="${style}">${esc(label)}</a>`;
}

function answerButtons(links: { href: string; label: string; primary?: boolean }[]): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 8px 0;">${links
    .map((l) => `<tr><td style="padding:0 0 10px 0;">${button(l.href, l.label, l.primary ?? true)}</td></tr>`)
    .join("")}</table>`;
}

function jobLine(job: { title: string; company: string | null }): string {
  return job.company ? `${job.title} at ${job.company}` : job.title;
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

/** First time someone tracks an outside job: the tracker link, so they can find it again, and a way to stop. */
/** A rendered email, before sending (also used for previews and screenshots). */
export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export interface WelcomeMail {
  base: string;
  job: { title: string; company: string | null };
  trackerUrl: string;
  stopAllUrl: string;
  unsubscribeUrl: string;
}

export function sendTrackerWelcome(to: string, opts: WelcomeMail): Promise<MailResult> {
  return send({ to, ...renderTrackerWelcome(opts) });
}

export function renderTrackerWelcome(opts: WelcomeMail): RenderedMail {
  const line = jobLine(opts.job);
  const body = [
    h1("Your application tracker"),
    p(`You asked us to track your application for <strong>${esc(line)}</strong>. We'll email you 7 and 21 days after you applied to ask how it went, so you can keep everything in one place.`),
    `<p style="margin:20px 0;">${button(opts.trackerUrl, "Open your tracker")}</p>`,
    p("Keep this email: the link is private and it is how you get back to your tracker. Anyone with the link can see and change it.", true),
    p(`Not you, or changed your mind? <a href="${esc(opts.stopAllUrl)}" style="color:${BLUE};">Stop all check-in emails</a>.`, true),
  ].join("\n");
  const text = [
    "Your application tracker",
    "",
    `You asked us to track your application for ${line}. We'll email you 7 and 21 days after you applied to ask how it went.`,
    "",
    `Open your tracker: ${opts.trackerUrl}`,
    "Keep this email: the link is private and it is how you get back to your tracker.",
    "",
    `Stop all check-in emails: ${opts.stopAllUrl}`,
  ].join("\n");
  return {
    subject: "Your MatchMySkillset application tracker",
    html: layout({ title: "Your application tracker", body, footer: "You are getting this because you asked MatchMySkillset to track a job application.", base: opts.base }),
    text,
    headers: { "List-Unsubscribe": `<${opts.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

export interface CheckinMail {
  base: string;
  /** 1 = the 7-day email, 2 = the 21-day email. */
  n: 1 | 2;
  job: { title: string; company: string | null };
  appliedOn: string;
  /** "through MatchMySkillset" or "on Reed" etc. */
  where: string;
  answers: Record<Exclude<CheckinAnswer, "stopall">, string>;
  trackerUrl: string;
  stopAllUrl: string;
  unsubscribeUrl: string;
}

/** "Did you hear back?" with one-tap answers. Each answer opens a page that asks the person to confirm. */
export function sendCheckin(to: string, m: CheckinMail): Promise<MailResult> {
  return send({ to, ...renderCheckin(m) });
}

export function renderCheckin(m: CheckinMail): RenderedMail {
  const line = jobLine(m.job);
  const heading = m.n === 1 ? "Did you hear back?" : "Any news on your application?";
  const order: Exclude<CheckinAnswer, "stopall">[] = ["no_response", "interview", "offer", "placed"];
  const body = [
    h1(heading),
    p(`You applied for <strong>${esc(line)}</strong> ${esc(m.where)} on ${esc(m.appliedOn)}. How did it go? One tap tells us:`),
    answerButtons(order.map((a) => ({ href: m.answers[a], label: CHECKIN_ANSWER_LABELS[a], primary: a !== "no_response" }))),
    p(`<a href="${esc(m.answers.stop)}" style="color:${BLUE};">${esc(CHECKIN_ANSWER_LABELS.stop)}</a> &middot; <a href="${esc(m.trackerUrl)}" style="color:${BLUE};">See all your applications</a>`),
    m.n === 1 ? p("We'll ask once more, 21 days after you applied, unless you tell us you got the job or ask us to stop.", true) : p("This is the last time we'll ask about this job.", true),
  ].join("\n");
  const text = [
    heading,
    "",
    `You applied for ${line} ${m.where} on ${m.appliedOn}. How did it go?`,
    "",
    ...order.map((a) => `${CHECKIN_ANSWER_LABELS[a]}: ${m.answers[a]}`),
    `${CHECKIN_ANSWER_LABELS.stop}: ${m.answers.stop}`,
    "",
    `See all your applications: ${m.trackerUrl}`,
    `Stop all check-in emails: ${m.stopAllUrl}`,
  ].join("\n");
  return {
    subject: m.n === 1 ? `Did you hear back about ${line}?` : `Any news on ${line}?`,
    html: layout({
      title: heading,
      body,
      footer: `You are getting this because you applied for this job and asked us to check in (7 and 21 days after applying). <a href="${esc(m.stopAllUrl)}" style="color:${MUTE};">Stop all check-in emails</a>.`,
      base: m.base,
    }),
    text,
    headers: { "List-Unsubscribe": `<${m.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

/** After a placement: the separate case-study question. Nothing is used unless they tick the box on the page. */
export interface ConsentMail {
  base: string;
  job: { title: string | null; company: string | null };
  consentUrl: string;
}

export function sendPlacementConsent(to: string, opts: ConsentMail): Promise<MailResult> {
  return send({ to, ...renderPlacementConsent(opts) });
}

export function renderPlacementConsent(opts: ConsentMail): RenderedMail {
  const role = opts.job.title ? (opts.job.company ? `${opts.job.title} at ${opts.job.company}` : opts.job.title) : "your new job";
  const body = [
    h1("Congratulations on your new job"),
    p(`We heard you have been taken on as <strong>${esc(role)}</strong>. Congratulations, and good luck in the new role.`),
    p("We would like to mention moves like yours, anonymised, in our case studies. That would mean describing the kind of job and field and how you found it, never your name, contact details or anything else that identifies you."),
    p("<strong>Can we mention your move, anonymised, in our case studies?</strong> It is entirely up to you. If you do nothing, we will not mention it."),
    `<p style="margin:20px 0;">${button(opts.consentUrl, "Tell us yes or no")}</p>`,
    p("You can change your answer at any time from the same link.", true),
  ].join("\n");
  const text = [
    "Congratulations on your new job",
    "",
    `We heard you have been taken on as ${role}. Congratulations, and good luck in the new role.`,
    "",
    "We would like to mention moves like yours, anonymised, in our case studies: the kind of job and field and how you found it, never your name, contact details or anything else that identifies you.",
    "",
    "Can we mention your move, anonymised, in our case studies? It is up to you. If you do nothing, we will not mention it.",
    `Tell us yes or no: ${opts.consentUrl}`,
    "",
    "You can change your answer at any time from the same link.",
  ].join("\n");
  return {
    subject: "Can we mention your move?",
    html: layout({ title: "Can we mention your move?", body, footer: "You are getting this because you got a job you applied for or tracked with MatchMySkillset. We send this once.", base: opts.base }),
    text,
  };
}
