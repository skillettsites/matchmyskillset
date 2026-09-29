import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { isValidEmail } from "@/lib/email/results-email";
import { getMmsJobRow, isLiveRow } from "@/lib/apis/jobs/mms";
import { applyConsentText } from "@/lib/candidates/consent";
import { employerMatch } from "@/lib/candidates/apply";
import { findCandidateByEmail, getEmployer, hasApplied, insertApplication, markEmployerNotified } from "@/lib/candidates/db";
import { sendApplicationReceipt, sendApplicationToEmployer, type ApplicationMail } from "@/lib/candidates/emails";
import { notifyEmployerOfApplication } from "@/lib/employer/notify";
import { trackMmsApplication } from "@/lib/tracking/tracker";
import { currentCandidateAccountId } from "@/lib/tracking/identity";

// "Apply with MatchMySkillset" for a job posted on the site. The applicant
// ticks a box naming the employer and the job; only then are their name,
// email, phone (if given), CV and note stored for that employer. We keep it for
// 12 months (delete_after) so the employer's dashboard can show it and the
// applicant can ask us to delete it. The employer is emailed by the employer
// side (notifyEmployerOfApplication, once per application). A job with no
// employer account (posted by us for someone) goes to its apply_email instead,
// with the application in the email, since there is no dashboard to see it in.

export const runtime = "nodejs";

const MIN_CV = 80;
const MAX_CV = 12_000;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json(403, { error: "Forbidden" });
  const raw = await request.text();
  if (raw.length > 60_000) return json(413, { error: "That is too long. Please keep your CV under 12,000 characters." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const name = cleanText(body.name, 80);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = cleanText(body.phone, 30) || null;
  const note = typeof body.note === "string" ? body.note.replace(/\r\n/g, "\n").trim().slice(0, 1500) || null : null;
  const cvText = typeof body.cvText === "string" ? body.cvText.replace(/\r\n/g, "\n").trim().slice(0, MAX_CV) : "";
  const token = typeof body.token === "string" ? body.token : null;

  if (name.length < 2) return json(400, { error: "Please add your name." });
  if (!isValidEmail(email)) return json(400, { error: "Please enter a valid email address." });
  if (phone && !/^[+\d][\d\s()-]{6,}$/.test(phone)) return json(400, { error: "Please check your phone number, or leave it out." });
  if (cvText.length < MIN_CV) return json(400, { error: "Please add your CV." });
  if (body.consent !== true) return json(400, { error: "Please tick the box so we can send your application." });

  const ip = await checkRateLimit(`apply:${clientIp(request)}`, 10, 3600);
  if (!ip.allowed) return json(429, { error: "You have sent a lot of applications in the last hour. Please try again later." });

  try {
    const job = await getMmsJobRow(jobId);
    if (!job || !isLiveRow(job)) return json(404, { error: "This job is no longer open." });
    if (job.apply_method === "url") return json(400, { error: "This employer takes applications on their own site." });
    if (await hasApplied(job.id, email)) return json(409, { error: "You have already applied for this job with this email address." });

    const employer = await getEmployer(job.account_id);
    if (!employer && !job.apply_email) {
      console.error(`[applications] job ${job.id} has no employer account or address for applications`);
      return json(503, { error: "We cannot send applications for this job just now. Please try again later." });
    }

    // The employer's number (the same function as their matched-candidates page).
    const fit = await employerMatch(job, { token, cvText }).catch(() => null);
    const consentText = applyConsentText(job.company_name, job.title);
    const candidate = await findCandidateByEmail(email).catch(() => null);
    const saved = await insertApplication({
      jobId: job.id,
      candidateId: candidate?.id ?? null,
      name,
      email,
      phone,
      cvText,
      note,
      matchScore: fit?.match ?? null,
      matchedSkills: fit?.matched ?? [],
      consentText,
    });

    const mail: ApplicationMail = {
      jobTitle: job.title,
      company: job.company_name,
      jobUrl: `/jobs/mms/${job.id}`,
      name,
      email,
      phone,
      note,
      cvText,
      match: fit?.match ?? null,
      matchKind: fit ? "skills" : null,
      matchedSkills: (fit?.matched ?? []).map((m) => m.name),
    };
    let employerEmailed = false;
    if (employer) {
      const n = await notifyEmployerOfApplication(saved.id);
      employerEmailed = n.ok;
      if (!n.ok) console.error(`[applications] employer notify failed for ${saved.id}: ${n.reason ?? "unknown"}`);
    } else if (job.apply_email) {
      const sent = await sendApplicationToEmployer(job.apply_email, mail);
      employerEmailed = sent.ok;
      if (sent.ok) await markEmployerNotified(saved.id);
      else console.error(`[applications] apply_email send failed for ${saved.id}:`, sent.error);
    }
    const receipt = await sendApplicationReceipt(email, mail);

    // Application tracker and "Did you hear back?" check-ins (the notice is on the apply form). Never blocks applying.
    const tracker = await trackMmsApplication({
      applicationId: saved.id,
      job,
      email,
      candidateId: candidate?.id ?? null,
      accountId: await currentCandidateAccountId(),
      resultsToken: token,
      trackerToken: typeof body.trackerToken === "string" ? body.trackerToken : null,
    });

    return json(200, { ok: true, id: saved.id, match: fit?.match ?? null, employerEmailed, receiptEmailed: receipt.ok, tracker });
  } catch (err) {
    console.error("[applications] failed:", err instanceof Error ? err.message : err);
    return json(500, { error: "We could not send your application just now. Please try again." });
  }
}
