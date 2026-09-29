// Employer-side emails, sent by Resend from jobs@matchmyskillset.com (the
// domain is verified; replies reach the jobs inbox). Server code only.
//
// Safety net for testing: outside production every email goes to Resend's
// test inbox (delivered@resend.dev) instead of the real address, and in
// production nothing is sent to reserved test domains (example.com etc).

import { Resend } from "resend";
import { env } from "@/lib/env";
import { esc, isValidEmail } from "@/lib/email/results-email";
import { SITE_URL } from "@/components/site";
import { JOBS_EMAIL } from "./plans";

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

export interface EmailResult {
  ok: boolean;
  id: string | null;
  error?: string;
}

function subjectSafe(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

async function send(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<EmailResult> {
  const original = opts.to.trim();
  if (!isValidEmail(original)) return { ok: false, id: null, error: "invalid_recipient" };
  let to = original;
  if (process.env.NODE_ENV !== "production") {
    to = TEST_INBOX;
    console.info(`[employer-email] dev: "${opts.subject}" for ${original} sent to ${TEST_INBOX}`);
  } else if (TEST_DOMAIN.test(original)) {
    console.info(`[employer-email] skipped test address ${original}: "${opts.subject}"`);
    return { ok: true, id: null, error: "test_address_skipped" };
  }
  const resendClient = client();
  if (!resendClient) {
    console.warn("[employer-email] RESEND_API_KEY is not set; email not sent");
    return { ok: false, id: null, error: "not_configured" };
  }
  try {
    const { data, error } = await resendClient.emails.send({
      from: FROM,
      to,
      replyTo: opts.replyTo && isValidEmail(opts.replyTo) ? opts.replyTo : JOBS_EMAIL,
      subject: subjectSafe(opts.subject),
      html: opts.html,
      text: opts.text,
    });
    if (error) {
      console.error("[employer-email] Resend error:", error.name, error.message);
      return { ok: false, id: null, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[employer-email] send failed:", err instanceof Error ? err.message : err);
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
      <a href="${esc(`${SITE_URL}/privacy`)}" style="color:#6e6e73;">Privacy</a> &middot;
      <a href="${esc(`${SITE_URL}/terms`)}" style="color:#6e6e73;">Terms</a>
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

function quote(text: string): string {
  return `<div style="margin:0 0 14px 0;padding:12px 14px;background:#f5f5f7;border-radius:12px;font-size:14px;line-height:1.55;color:#424245;white-space:pre-wrap;">${esc(text)}</div>`;
}

const EMPLOYER_FOOTER = "You are getting this because you have an employer account on MatchMySkillset.";

export function sendMagicLink(to: string, url: string): Promise<EmailResult> {
  const html = layout(
    "Sign in to MatchMySkillset",
    `${h1("Your sign-in link")}
     ${p("Use this button to sign in to your MatchMySkillset employer account. It works once, within 20 minutes.")}
     ${button(url, "Sign in")}
     ${p("If you did not ask for this, you can ignore this email. Nobody can sign in without the link.", true)}`,
    "You are getting this one email because someone entered this address on the MatchMySkillset employer sign-in page."
  );
  const text = `Sign in to your MatchMySkillset employer account (works once, within 20 minutes):\n${url}\n\nIf you did not ask for this, ignore this email.`;
  return send({ to, subject: "Your MatchMySkillset sign-in link", html, text });
}

export function sendNewApplication(
  to: string,
  opts: { jobTitle: string; name: string; score: number | null; skills: string[]; note: string | null; url: string }
): Promise<EmailResult> {
  const scoreLine = typeof opts.score === "number" ? ` Their CV matches ${opts.score}% of the skills in your advert.` : "";
  const skills = opts.skills.slice(0, 8);
  const html = layout(
    `New applicant: ${opts.jobTitle}`,
    `${h1(`New applicant for ${opts.jobTitle}`)}
     ${p(`<strong>${esc(opts.name)}</strong> has applied through MatchMySkillset.${esc(scoreLine)}`)}
     ${skills.length ? p(`Matching skills: ${esc(skills.join(", "))}.`) : ""}
     ${opts.note ? `${p("Their note:", true)}${quote(opts.note.slice(0, 1200))}` : ""}
     ${button(opts.url, "See their CV and details")}
     ${p("They agreed to share their CV and contact details with you for this role only. Please use them only to consider them for it.", true)}`,
    EMPLOYER_FOOTER
  );
  const text = [
    `New applicant for ${opts.jobTitle}: ${opts.name}.${scoreLine}`,
    skills.length ? `Matching skills: ${skills.join(", ")}.` : "",
    opts.note ? `Their note:\n${opts.note.slice(0, 1200)}` : "",
    `See their CV and details: ${opts.url}`,
    "They agreed to share their CV and contact details with you for this role only.",
  ]
    .filter(Boolean)
    .join("\n\n");
  return send({ to, subject: `New applicant for ${opts.jobTitle}`, html, text });
}

const SHORTLIST_STARTED = "Our recruiters are now putting together your shortlist for this role. We will email you when it is ready.";

export function sendJobApproved(to: string, opts: { jobTitle: string; expires: string; url: string; shortlist?: boolean }): Promise<EmailResult> {
  const html = layout(
    `Your job is live: ${opts.jobTitle}`,
    `${h1("Your job is live")}
     ${p(`<strong>${esc(opts.jobTitle)}</strong> is now live on MatchMySkillset and is being matched to job seekers whose CV skills fit. It runs until ${esc(opts.expires)}; you can renew it from your dashboard.`)}
     ${opts.shortlist ? p(esc(SHORTLIST_STARTED)) : ""}
     ${button(opts.url, "Open your dashboard")}`,
    EMPLOYER_FOOTER
  );
  const text = `${opts.jobTitle} is now live on MatchMySkillset. It runs until ${opts.expires}.${opts.shortlist ? `\n\n${SHORTLIST_STARTED}` : ""}\n\nYour dashboard: ${opts.url}`;
  return send({ to, subject: `Your job is live: ${opts.jobTitle}`, html, text });
}

export function sendShortlistReady(
  to: string,
  opts: { jobTitle: string; count: number; applicants: number; recruiter: string | null; summary: string | null; url: string }
): Promise<EmailResult> {
  const people = `${opts.count} ${opts.count === 1 ? "person" : "people"}`;
  const from = opts.recruiter ? `${opts.recruiter} from our recruitment team` : "Our recruitment team";
  const mix =
    opts.applicants === opts.count
      ? opts.count === 1
        ? "They applied to this job."
        : "All of them applied to this job."
      : opts.applicants === 0
        ? "They asked employers to find them and have not applied yet, so they stay anonymous until they accept a request to contact them."
        : `${opts.applicants} applied to this job. The others asked employers to find them, so they stay anonymous until they accept a request to contact them.`;
  const html = layout(
    `Your recruiter shortlist: ${opts.jobTitle}`,
    `${h1(`Your shortlist for ${opts.jobTitle} is ready`)}
     ${p(`${esc(from)} has picked <strong>${esc(people)}</strong> for this role, in order, with a note on each.`)}
     ${p(esc(mix))}
     ${opts.summary ? `${p("Their summary:", true)}${quote(opts.summary.slice(0, 2000))}` : ""}
     ${button(opts.url, "See the shortlist")}
     ${p("A shortlist is a recruiter's view of who fits best, to help you decide who to talk to first. The hiring decision is yours.", true)}`,
    EMPLOYER_FOOTER
  );
  const text = [
    `Your shortlist for ${opts.jobTitle} is ready.`,
    `${from} has picked ${people} for this role, in order, with a note on each. ${mix}`,
    opts.summary ? `Their summary:\n${opts.summary.slice(0, 2000)}` : "",
    `See the shortlist: ${opts.url}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return send({ to, subject: `Your recruiter shortlist for ${opts.jobTitle} is ready`, html, text });
}

export function sendJobRejected(to: string, opts: { jobTitle: string; reason: string; url: string }): Promise<EmailResult> {
  const html = layout(
    `Changes needed: ${opts.jobTitle}`,
    `${h1("Your job needs a change before it can go live")}
     ${p(`We checked <strong>${esc(opts.jobTitle)}</strong> and could not approve it yet. Here is why:`)}
     ${quote(opts.reason)}
     ${p("Edit the job in your dashboard and submit it again, or reply to this email if you have a question.")}
     ${button(opts.url, "Edit the job")}`,
    EMPLOYER_FOOTER
  );
  const text = `We could not approve ${opts.jobTitle} yet.\n\nWhy: ${opts.reason}\n\nEdit and resubmit it here: ${opts.url}\nOr reply to this email with any question.`;
  return send({ to, subject: `Changes needed: ${opts.jobTitle}`, html, text });
}

export function sendContactRequestToCandidate(
  to: string,
  opts: { company: string; jobTitle: string | null; message: string | null; respondUrl: string; manageUrl: string | null }
): Promise<EmailResult> {
  const about = opts.jobTitle ? ` about their <strong>${esc(opts.jobTitle)}</strong> role` : "";
  const aboutText = opts.jobTitle ? ` about their ${opts.jobTitle} role` : "";
  const html = layout(
    `${opts.company} would like to contact you`,
    `${h1(`${opts.company} would like to contact you`)}
     ${p(`You asked MatchMySkillset to let employers find you. <strong>${esc(opts.company)}</strong> saw your anonymous profile and would like to talk to you${about}.`)}
     ${opts.message ? `${p("Their message:", true)}${quote(opts.message.slice(0, 1000))}` : ""}
     ${p("They do not have your name, email address or CV. If you accept, we will share your name, email address and CV with them so they can get in touch. If you decline, they will not be told who you are.")}
     ${button(opts.respondUrl, "Accept or decline")}
     ${opts.manageUrl ? p(`To stop employers finding you, or to delete your profile, use <a href="${esc(opts.manageUrl)}" style="color:#0066cc;">your profile link</a>.`, true) : ""}`,
    "You are getting this because you turned on \"Let employers find me\" on MatchMySkillset."
  );
  const text = [
    `${opts.company} would like to talk to you${aboutText}. They found your anonymous profile on MatchMySkillset.`,
    opts.message ? `Their message:\n${opts.message.slice(0, 1000)}` : "",
    "They do not have your name, email address or CV. If you accept, we will share your name, email address and CV with them. If you decline, they will not be told who you are.",
    `Accept or decline: ${opts.respondUrl}`,
    opts.manageUrl ? `Stop employers finding you or delete your profile: ${opts.manageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return send({ to, subject: `${opts.company} would like to contact you`, html, text });
}

export function sendContactResponseToEmployer(
  to: string,
  opts: { accepted: boolean; headline: string; url: string }
): Promise<EmailResult> {
  const title = opts.accepted ? "A candidate accepted your request" : "A candidate declined your request";
  const html = layout(
    title,
    `${h1(title)}
     ${p(
       opts.accepted
         ? `The candidate "${esc(opts.headline)}" accepted your request to contact them. Their name, email address and CV are now in your dashboard.`
         : `The candidate "${esc(opts.headline)}" decided not to share their details this time.`
     )}
     ${button(opts.url, "Open contact requests")}`,
    EMPLOYER_FOOTER
  );
  const text = `${title}: "${opts.headline}".\n\n${opts.url}`;
  return send({ to, subject: title, html, text });
}

export function sendEnquiry(opts: {
  name: string;
  email: string;
  company: string;
  interest: string;
  message: string;
  accountEmail: string | null;
}): Promise<EmailResult> {
  const rows: [string, string][] = [
    ["Name", opts.name],
    ["Email", opts.email],
    ["Company", opts.company],
    ["Interested in", opts.interest],
    ["Signed-in account", opts.accountEmail || "not signed in"],
  ];
  const html = layout(
    `Employer enquiry: ${opts.interest}`,
    `${h1(`Employer enquiry: ${opts.interest}`)}
     <table style="font-size:14px;line-height:1.6;margin:0 0 14px 0;">${rows
       .map(([k, v]) => `<tr><td style="color:#6e6e73;padding-right:14px;vertical-align:top;">${esc(k)}</td><td>${esc(v)}</td></tr>`)
       .join("")}</table>
     ${opts.message ? quote(opts.message) : ""}
     ${p("Reply to this email to answer them directly.", true)}`,
    "Sent from the enquiry form on matchmyskillset.com/employers."
  );
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${opts.message}`;
  return send({ to: JOBS_EMAIL, subject: `Employer enquiry (${opts.interest}): ${opts.company}`, html, text, replyTo: opts.email });
}
