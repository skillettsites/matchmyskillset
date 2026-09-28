import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEmployer } from "@/lib/employer/session";
import { formatDate } from "@/lib/employer/jobs";
import { contactDisplayStatus, CONTACT_EXPIRY_DAYS } from "@/lib/employer/candidates";
import type { ContactStatus } from "@/lib/employer/types";
import { Badge, EmptyState, PageHead, type Tone } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Contact requests", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const LABEL: Record<ContactStatus, { text: string; tone: Tone }> = {
  pending: { text: "Waiting for their answer", tone: "amber" },
  accepted: { text: "Accepted", tone: "green" },
  declined: { text: "Declined", tone: "grey" },
  expired: { text: "No answer", tone: "grey" },
};

interface Anon {
  id: string;
  headline: string | null;
  current_role: string | null;
  region: string | null;
}

interface Shared {
  id: string;
  first_name: string | null;
  email: string;
  cv_text: string | null;
}

export default async function RequestsPage() {
  const account = await requireEmployer();
  const admin = createAdminClient();
  const { data } = await admin
    .from("mms_contact_requests")
    .select("id, created_at, candidate_id, job_id, message, status, responded_at")
    .eq("account_id", account.id)
    .order("created_at", { ascending: false })
    .limit(300);
  const rows = data ?? [];
  const candidateIds = [...new Set(rows.map((r) => r.candidate_id))];
  const acceptedIds = [...new Set(rows.filter((r) => r.status === "accepted").map((r) => r.candidate_id))];
  const jobIds = [...new Set(rows.map((r) => r.job_id).filter((x): x is string => Boolean(x)))];

  const [anon, shared, jobs] = await Promise.all([
    candidateIds.length ? admin.from("mms_candidates").select('id, headline, "current_role", region').in("id", candidateIds) : Promise.resolve({ data: [] }),
    // Name, email and CV only for people who accepted this employer's request.
    acceptedIds.length ? admin.from("mms_candidates").select("id, first_name, email, cv_text").in("id", acceptedIds) : Promise.resolve({ data: [] }),
    jobIds.length ? admin.from("mms_jobs").select("id, title").in("id", jobIds).eq("account_id", account.id) : Promise.resolve({ data: [] }),
  ]);
  const anonMap = new Map(((anon.data ?? []) as unknown as Anon[]).map((c) => [c.id, c]));
  const sharedMap = new Map(((shared.data ?? []) as Shared[]).map((c) => [c.id, c]));
  const jobMap = new Map(((jobs.data ?? []) as { id: string; title: string }[]).map((j) => [j.id, j.title]));

  return (
    <div>
      <PageHead title="Contact requests">
        People you asked to talk to. Requests with no answer after {CONTACT_EXPIRY_DAYS} days are shown as no answer. If someone accepts, their name, email address
        and CV appear here.
      </PageHead>

      {rows.length === 0 ? (
        <EmptyState
          title="No requests yet."
          action={
            <Link href="/employers/dashboard/candidates" className="btn btn-primary">
              Find candidates
            </Link>
          }
        >
          Search people who asked to be found and send a short request. They decide whether to share their details.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const status = contactDisplayStatus(r);
            const c = anonMap.get(r.candidate_id);
            const s = status === "accepted" ? sharedMap.get(r.candidate_id) : undefined;
            return (
              <li key={r.id} className="rounded-[22px] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold text-ink">{s?.first_name ? s.first_name : c?.headline || c?.current_role || "Candidate"}</p>
                    <p className="mt-1 text-[14px] text-mute">
                      {[s ? c?.headline : null, c?.current_role, c?.region].filter(Boolean).join(" · ")}
                      {r.job_id && jobMap.get(r.job_id) ? ` · About ${jobMap.get(r.job_id)}` : ""} · Asked {formatDate(r.created_at)}
                      {r.responded_at ? ` · Answered ${formatDate(r.responded_at)}` : ""}
                    </p>
                  </div>
                  <Badge tone={LABEL[status].tone}>{LABEL[status].text}</Badge>
                </div>
                {r.message && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-[14px] leading-relaxed text-ink-2">{r.message}</p>}
                {s && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[15px]">
                      <span className="text-mute">Email: </span>
                      <a href={`mailto:${s.email}`} className="break-all text-link hover:underline">
                        {s.email}
                      </a>
                    </p>
                    {s.cv_text ? (
                      <details>
                        <summary className="cursor-pointer text-[15px] font-medium text-link">Show their CV</summary>
                        <pre className="mt-3 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cloud p-4 font-sans text-[14px] leading-relaxed text-ink-2">
                          {s.cv_text}
                        </pre>
                      </details>
                    ) : (
                      <p className="text-[14px] text-mute">They did not include a CV.</p>
                    )}
                    <p className="text-[12px] text-mute">They accepted your request, so we have shared these details. Use them only to talk to them about working with you.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
