import { Resend } from "resend";
import { env } from "@/lib/env";
import { SITE_URL } from "@/components/site";
import { CONTACT_EMAIL } from "@/lib/site";
import { esc } from "@/lib/email/results-email";

// Server-only. Emails to job seekers and to employers about job seekers, sent
// from jobs@matchmyskillset.com. Every value that came from a person (names,
// notes, CV text, job titles typed by employers) is HTML-escaped. Addresses at
// example.com and example.org are never sent to (test records).

const FROM = "MatchMySkillset <jobs@matchmyskillset.com>";

let client: Resend | null | undefined;
function resend(): Resend | null {
  if (client === undefined) {
    const key = env("RESEND_API_KEY");
    client = key ? new Resend(key) : null;
  }
  return client;
}

export interface MailResult {
  ok: boolean;
  id: string | null;
  error?: string;
}

function subjectSafe(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

function isTestAddress(to: string): boolean {
  return /@example\.(com|org|net)$/i.test(to.trim());
}

async function send(opts: { to: string; subject: string; html: string; text: string; replyTo?: string; headers?: Record<string, string> }): Promise<MailResult> {
  if (isTestAddress(opts.to)) {
    console.log(`[mail] skipped test address (${opts.subject})`);
    return { ok: false, id: null, error: "test_address" };
  }
  const r = resend();
  if (!r) {
    console.warn("[mail] RESEND_API_KEY is not set; email not sent");
    return { ok: false, id: null, error: "not_configured" };
  }
  try {
    const { data, error } = await r.emails.send({
      from: FROM,
      to: opts.to.trim(),
      replyTo: opts.replyTo ?? CONTACT_EMAIL,
      subject: subjectSafe(opts.subject),
      html: opts.html,
      text: opts.text,
      ...(opts.headers ? { headers: opts.headers } : {}),
    });
    if (error) {
      console.error("[mail] Resend error:", error.name, error.message);
      return { ok: false, id: null, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[mail] send failed:", err instanceof Error ? err.message : err);
    return { ok: false, id: null, error: "send_failed" };
  }
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const INK = "#1d1d1f";
const MUTE = "#6e6e73";
const BLUE = "#0071e3";

function layout(title: string, body: string, footer: string, extraLinks = ""): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:580px;margin:0 auto;padding:28px 18px;">
    <p style="margin:0 0 18px 4px;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:${INK};">MatchMySkillset</p>
    <div style="background:#ffffff;border-radius:22px;padding:26px 24px;">
      ${body}
    </div>
    <p style="font-size:12px;line-height:1.55;color:${MUTE};margin:18px 4px 0 4px;">
      ${footer}<br>
      ${extraLinks}<a href="${esc(`${SITE_URL}/privacy`)}" style="color:${MUTE};">Privacy</a> &middot; <a href="${esc(`${SITE_URL}/terms`)}" style="color:${MUTE};">Terms</a>
    </p>
  </div>
</body>
</html>`;
}

function h1(text: string): string {
  return `<h1 style="font-size:22px;line-height:1.2;letter-spacing:-0.02em;margin:0 0 12px 0;">${esc(text)}</h1>`;
}

function p(html: string, muted = false): string {
  return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:${muted ? MUTE : INK};">${html}</p>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${esc(href)}" style="display:inline-block;background:${BLUE};color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:980px;">${esc(label)}</a></p>`;
}

function preBlock(text: string): string {
  return `<div style="margin:8px 0 14px 0;padding:14px 16px;background:#f5f5f7;border-radius:14px;font-size:13px;line-height:1.55;white-space:pre-wrap;color:${INK};">${esc(text)}</div>`;
}

function plain(lines: (string | false | null | undefined)[]): string {
  return lines.filter((l): l is string => typeof l === "string").join("\n");
}

// ---------------------------------------------------------------------------
// Job alerts
// ---------------------------------------------------------------------------

export interface AlertJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  match: number;
  reason: string;
  url: string;
  sourceLabel: string;
}

function absolute(url: string): string {
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

export function alertLinks(manageToken: string) {
  const manage = `${SITE_URL}/alerts/${encodeURIComponent(manageToken)}`;
  return {
    manage,
    unsubscribe: `${manage}?unsubscribe=1`,
    oneClick: `${SITE_URL}/api/alerts/unsubscribe?token=${encodeURIComponent(manageToken)}`,
  };
}

export async function sendAlertWelcome(to: string, o: { manageToken: string; frequency: "daily" | "weekly"; titles: string[]; where: string }): Promise<MailResult> {
  const links = alertLinks(o.manageToken);
  const when = o.frequency === "daily" ? "each morning when there are new matches" : "every Monday morning when there are new matches";
  const titles = o.titles.slice(0, 4).join(", ");
  const html = layout(
    "Your job alert is set up",
    `${h1("Your job alert is set up")}
     ${p(`We will email you new live jobs that match your CV ${esc(when)}. We search for ${esc(titles)} ${esc(o.where)}, and only send jobs you have not had from us before.`)}
     ${button(links.manage, "Change or stop this alert")}
     ${p("You can also unsubscribe with one click from any alert email.", true)}`,
    "You are getting this because you set up a job alert on MatchMySkillset.",
    `<a href="${esc(links.unsubscribe)}" style="color:${MUTE};">Unsubscribe</a> &middot; `
  );
  const text = plain([
    "Your job alert is set up.",
    `We will email you new live jobs that match your CV ${when}. We search for ${titles} ${o.where}.`,
    `Change or stop this alert: ${links.manage}`,
    `Unsubscribe: ${links.unsubscribe}`,
  ]);
  return send({ to, subject: "Your MatchMySkillset job alert is set up", html, text, headers: unsubscribeHeaders(links.oneClick) });
}

function unsubscribeHeaders(oneClick: string): Record<string, string> {
  return { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}

export async function sendAlertDigest(to: string, o: { manageToken: string; jobs: AlertJob[]; where: string }): Promise<MailResult> {
  const links = alertLinks(o.manageToken);
  const n = o.jobs.length;
  const rows = o.jobs
    .map(
      (j) => `<tr><td style="padding:14px 0;border-bottom:1px solid #e8e8ed;">
        <a href="${esc(absolute(j.url))}" style="font-size:16px;font-weight:600;color:${INK};text-decoration:none;">${esc(j.title)}</a>
        <div style="font-size:14px;color:${MUTE};margin-top:2px;">${esc(j.company)} &middot; ${esc(j.location)}${j.salary ? ` &middot; <strong style="color:${INK};">${esc(j.salary)}</strong>` : ""}</div>
        <div style="font-size:14px;margin-top:6px;"><strong style="color:#1d7f37;">${j.match}% match</strong> &middot; ${esc(j.reason)}</div>
        <div style="font-size:13px;margin-top:6px;"><a href="${esc(absolute(j.url))}" style="color:${BLUE};">${j.sourceLabel === "Posted on MatchMySkillset" ? "Apply with MatchMySkillset" : `View on ${esc(j.sourceLabel)}`}</a></div>
      </td></tr>`
    )
    .join("");
  const html = layout(
    `${n} new jobs for you`,
    `${h1(`${n} new job${n === 1 ? "" : "s"} that match your CV`)}
     ${p(`New since your last alert, ${esc(o.where)}. Scored against the skills in your results.`, true)}
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows}</table>
     ${button(links.manage, "Change this alert")}`,
    "You are getting this because you set up a job alert on MatchMySkillset. Jobs come from the boards named on each one; we do not write or check the adverts.",
    `<a href="${esc(links.unsubscribe)}" style="color:${MUTE};">Unsubscribe</a> &middot; `
  );
  const text = plain([
    `${n} new job${n === 1 ? "" : "s"} that match your CV (${o.where}):`,
    "",
    ...o.jobs.map((j) => `${j.title}, ${j.company}, ${j.location}${j.salary ? `, ${j.salary}` : ""}\n${j.match}% match: ${j.reason}\n${absolute(j.url)}\n`),
    `Change this alert: ${links.manage}`,
    `Unsubscribe: ${links.unsubscribe}`,
  ]);
  return send({ to, subject: `${n} new job${n === 1 ? "" : "s"} that match your CV`, html, text, headers: unsubscribeHeaders(links.oneClick) });
}

// ---------------------------------------------------------------------------
// Candidate profile
// ---------------------------------------------------------------------------

export function manageUrl(token: string): string {
  return `${SITE_URL}/me/${encodeURIComponent(token)}`;
}

export async function sendProfileConfirm(to: string, o: { firstName: string | null; manageToken: string }): Promise<MailResult> {
  const url = manageUrl(o.manageToken);
  const hi = o.firstName ? `Hi ${esc(o.firstName)},` : "Hello,";
  const html = layout(
    "Switch on your profile",
    `${h1("One more step: switch on your profile")}
     ${p(hi)}
     ${p("You asked us to let employers find you on MatchMySkillset. To make sure this email address is yours, your profile stays hidden until you switch it on.")}
     ${button(`${url}?confirm=1`, "Switch on my profile")}
     ${p("Employers will see your headline, job title, region, years of experience and skills. They never see your name, email or CV unless you accept a request from them.", true)}
     ${p(`This link is also how you edit your profile, switch it off or delete it, so keep this email. If you did not ask for this, ignore it: nothing is shown to anyone, and the profile is deleted after 14 days.`, true)}`,
    "You are getting this because someone entered this address on MatchMySkillset to create a job seeker profile."
  );
  const text = plain([
    hi,
    "You asked us to let employers find you on MatchMySkillset. Your profile stays hidden until you switch it on:",
    `${url}?confirm=1`,
    "Employers see your headline, job title, region, years of experience and skills, never your name, email or CV unless you accept a request.",
    "If you did not ask for this, ignore this email: nothing is shown and the profile is deleted after 14 days.",
  ]);
  return send({ to, subject: "Switch on your MatchMySkillset profile", html, text });
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export interface ApplicationMail {
  jobTitle: string;
  company: string;
  jobUrl: string;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  cvText: string;
  match: number | null;
  /** "full": title and skills (with a results link); "skills": skills in the advert only. */
  matchKind: "full" | "skills" | null;
  matchedSkills: string[];
}

export async function sendApplicationToEmployer(to: string, a: ApplicationMail): Promise<MailResult> {
  const dashboard = `${SITE_URL}/employers/dashboard`;
  const skillsNote = a.matchedSkills.length ? ` Skills from your advert in their CV include ${esc(a.matchedSkills.slice(0, 5).join(", "))}.` : "";
  const matchLine =
    a.match === null
      ? ""
      : a.matchKind === "skills"
        ? `<strong>${a.match}% skills match:</strong> the share of the skills in your advert that we found in their CV (skills in the job title count double, and a skill shown only in part counts half).${skillsNote}`
        : `<strong>${a.match}% match</strong> on MatchMySkillset's score (40% how close the job title is to their experience, 60% the skills in your advert that their CV shows).${skillsNote}`;
  const html = layout(
    `New applicant: ${a.jobTitle}`,
    `${h1(`New applicant for ${a.jobTitle}`)}
     ${p(`<strong>${esc(a.name)}</strong> applied through MatchMySkillset and agreed to us sending you their details.`)}
     ${matchLine ? p(matchLine) : ""}
     ${p(`Email: <a href="mailto:${esc(a.email)}" style="color:${BLUE};">${esc(a.email)}</a>${a.phone ? `<br>Phone: ${esc(a.phone)}` : ""}`)}
     ${a.note ? `${p("<strong>Their note</strong>")}${preBlock(a.note)}` : ""}
     ${p("<strong>CV</strong>")}
     ${preBlock(a.cvText)}
     ${button(dashboard, "See all applicants")}
     ${p("Reply to this email to contact the applicant directly. Please handle their details under your own privacy policy and delete them when you no longer need them.", true)}`,
    `Sent by MatchMySkillset because ${esc(a.name)} applied for ${esc(a.jobTitle)} at ${esc(a.company)}.`
  );
  const text = plain([
    `New applicant for ${a.jobTitle}: ${a.name}`,
    a.match !== null ? `${a.match}% ${a.matchKind === "skills" ? "skills match" : "match"}${a.matchedSkills.length ? ` (skills from your advert in their CV: ${a.matchedSkills.slice(0, 5).join(", ")})` : ""}.` : null,
    `Email: ${a.email}`,
    a.phone ? `Phone: ${a.phone}` : null,
    a.note ? `\nTheir note:\n${a.note}` : null,
    `\nCV:\n${a.cvText}`,
    `\nAll applicants: ${dashboard}`,
  ]);
  return send({ to, subject: `New applicant for ${a.jobTitle}: ${a.name}`, html, text, replyTo: a.email });
}

export async function sendApplicationReceipt(to: string, a: ApplicationMail): Promise<MailResult> {
  const html = layout(
    `Your application: ${a.jobTitle}`,
    `${h1("Your application has been sent")}
     ${p(`Your application for <strong>${esc(a.jobTitle)}</strong> at <strong>${esc(a.company)}</strong> has gone to the employer: your name, email${a.phone ? ", phone number" : ""}, CV${a.note ? " and note" : ""}.`)}
     ${a.match !== null ? p(`The employer sees your skills match for this job: ${a.match}%, the share of the skills in their advert that we found in your CV.`) : ""}
     ${p(`${esc(a.company)} will contact you directly if they want to take it further. We do not hear back from them, so please follow up with them if you need to.`)}
     ${button(absolute(a.jobUrl), "View the job")}`,
    "This is a one-off receipt for an application you made on MatchMySkillset. We keep a copy of your application for 12 months, then delete it."
  );
  const text = plain([
    `Your application for ${a.jobTitle} at ${a.company} has been sent.`,
    `${a.company} will contact you directly if they want to take it further.`,
    `The job: ${absolute(a.jobUrl)}`,
  ]);
  return send({ to, subject: `Application sent: ${a.jobTitle} at ${a.company}`, html, text });
}
