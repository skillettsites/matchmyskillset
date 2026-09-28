import { Resend } from "resend";
import { env } from "@/lib/env";
import { SITE_URL } from "@/components/site";
import { CONTACT_EMAIL } from "@/lib/site";

// Server-only. Two one-off emails, each sent only because the person asked:
//   sendResultsLink()  the free results link, from /results/<token>
//   sendReportLink()   the paid report link, from the Stripe webhook
// Every interpolated value is HTML-escaped (titles come from model output and
// user input). There is no mailing list and nothing else is ever sent.

const FROM = "MatchMySkillset <results@matchmyskillset.com>";

let resend: Resend | null | undefined;

function getResend(): Resend | null {
  if (resend === undefined) {
    const key = env("RESEND_API_KEY");
    resend = key ? new Resend(key) : null;
  }
  return resend;
}

export function isEmailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY"));
}

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Subject lines are plain text: no control characters, bounded length. */
function subjectSafe(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_RE.test(value.trim());
}

function layout(title: string, bodyHtml: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#18201d;">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <p style="font-size:18px;font-weight:bold;margin:0 0 20px 0;color:#18201d;">MatchMySkillset</p>
    <div style="background:#ffffff;border:1px solid #dcd3c3;border-radius:10px;padding:24px;">
      ${bodyHtml}
    </div>
    <p style="font-size:12px;line-height:1.5;color:#58625d;margin:18px 0 0 0;">
      ${esc(footerNote)}<br>
      <a href="${esc(`${SITE_URL}/privacy`)}" style="color:#58625d;">Privacy</a> &middot;
      <a href="${esc(`${SITE_URL}/terms`)}" style="color:#58625d;">Terms</a>
    </p>
  </div>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:22px 0;"><a href="${esc(href)}" style="display:inline-block;background:#1b5e4b;color:#ffffff;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px;">${esc(label)}</a></p>`;
}

export interface SendResult {
  ok: boolean;
  id: string | null;
  error?: string;
}

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY is not set; email not sent");
    return { ok: false, id: null, error: "not_configured" };
  }
  try {
    const { data, error } = await client.emails.send({
      from: FROM,
      to: to.trim(),
      // Replies go to the monitored contact address, not the sending address.
      replyTo: CONTACT_EMAIL,
      subject: subjectSafe(subject),
      html,
      text,
    });
    if (error) {
      console.error("[email] Resend error:", error.name, error.message);
      return { ok: false, id: null, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[email] send failed:", err instanceof Error ? err.message : err);
    return { ok: false, id: null, error: "send_failed" };
  }
}

export async function sendResultsLink(
  to: string,
  opts: { token: string; currentRole: string | null; topTitles: string[] }
): Promise<SendResult> {
  const url = `${SITE_URL}/results/${encodeURIComponent(opts.token)}`;
  const top = opts.topTitles.slice(0, 3);
  const intro = opts.currentRole
    ? `Here is the link to your MatchMySkillset results, starting from ${esc(opts.currentRole.toLowerCase())}.`
    : "Here is the link to your MatchMySkillset results.";
  const list = top.length
    ? `<p style="margin:14px 0 6px 0;">Your closest matches were:</p><ul style="margin:0;padding-left:20px;">${top.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
    : "";
  const note = "You are getting this one-off email because you asked us to send your results link. We will not email you again unless you ask. The link works for 12 months.";
  const html = layout(
    "Your MatchMySkillset results",
    `<h1 style="font-size:20px;margin:0 0 12px 0;">Your results link</h1>
     <p style="margin:0;line-height:1.5;">${intro}</p>
     ${list}
     ${button(url, "Open my results")}
     <p style="margin:0;font-size:13px;color:#58625d;line-height:1.5;">Anyone with this link can see your results, so only share it with people you trust.</p>`,
    note
  );
  const text = [
    intro.replace(/&[a-z#0-9]+;/g, ""),
    top.length ? `\nYour closest matches were:\n${top.map((t) => `- ${t}`).join("\n")}` : "",
    `\nOpen your results: ${url}`,
    "\nAnyone with this link can see your results, so only share it with people you trust.",
    `\n${note}`,
  ].join("\n");
  const subject = top.length ? `Your career matches, starting with ${top[0]}` : "Your MatchMySkillset results";
  return send(to, subject, html, text);
}

export async function sendReportLink(
  to: string,
  opts: { token: string; sessionId: string; destination: string }
): Promise<SendResult> {
  const url = `${SITE_URL}/report/${encodeURIComponent(opts.token)}?session_id=${encodeURIComponent(opts.sessionId)}`;
  const note =
    "You are getting this email because you bought a Career Change Report. It is a receipt for your purchase, not marketing. Stripe sends the payment receipt separately.";
  const html = layout(
    `Your Career Change Report: ${opts.destination}`,
    `<h1 style="font-size:20px;margin:0 0 12px 0;">Your Career Change Report is ready</h1>
     <p style="margin:0;line-height:1.5;">Thank you for your order. Your report on becoming a ${esc(opts.destination.toLowerCase())} is ready to read, print or save as a PDF.</p>
     ${button(url, "Open my report")}
     <p style="margin:0;font-size:13px;color:#58625d;line-height:1.5;">Keep this email: the link is how you get back to your report. It works for 12 months. Anyone with the link can open the report.</p>`,
    note
  );
  const text = [
    "Your Career Change Report is ready.",
    `\nYour report on becoming a ${opts.destination.toLowerCase()} is here: ${url}`,
    "\nKeep this email: the link is how you get back to your report. It works for 12 months. Anyone with the link can open the report.",
    `\n${note}`,
  ].join("\n");
  return send(to, `Your Career Change Report: ${opts.destination}`, html, text);
}
