import type { ReactNode } from "react";
import Link from "next/link";
import { TRACKED_STATUS_LABELS, type TrackedStatus } from "@/lib/tracking/constants";
import type { TrackedRow } from "@/lib/tracking/tracker";

// A job seeker's tracked applications. Presentational (server component):
// the /tracker page passes its own forms as `controls`; a candidate account
// page can render the same list with its own (see src/lib/tracking/identity.ts).

const TONE: Record<TrackedStatus, string> = {
  applied: "bg-cloud text-ink-2",
  no_response: "bg-cloud text-ink-2",
  interview: "bg-[#e8f1fd] text-[#0058b0]",
  offer: "bg-[#fff4e0] text-[#8a5300]",
  placed: "bg-[#e8f6ec] text-[#1d7f37]",
  withdrawn: "bg-cloud text-mute",
};

const SOURCE_NAMES: Record<string, string> = {
  mms: "MatchMySkillset",
  reed: "Reed",
  adzuna: "Adzuna",
  "teaching-vacancies": "Teaching Vacancies",
  careerjet: "Careerjet",
  jooble: "Jooble",
  himalayas: "Himalayas",
  remotive: "Remotive",
};

function day(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }) : "";
}

export function checkinLine(row: TrackedRow): string {
  if (row.checkins_stopped_at) return "Check-in emails stopped";
  if (row.status === "placed" || row.status === "withdrawn") return "No more check-ins needed";
  if (row.next_checkin_at) return `Next check-in email: ${day(row.next_checkin_at)}`;
  return row.checkins_sent > 0 ? "Both check-ins sent" : "";
}

export function TrackerList({ rows, controls }: { rows: TrackedRow[]; controls?: (row: TrackedRow) => ReactNode }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const internal = row.job_url?.startsWith("/");
        return (
          <li key={row.id} className="card-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[18px] font-semibold leading-snug tracking-[-0.02em] text-ink">
                  {row.job_url ? (
                    internal ? (
                      <Link href={row.job_url} className="hover:text-blue">
                        {row.job_title}
                      </Link>
                    ) : (
                      <a href={row.job_url} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-blue">
                        {row.job_title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )
                  ) : (
                    row.job_title
                  )}
                </p>
                <p className="mt-0.5 text-[15px] text-ink-2">
                  {row.company || "Company not given"}
                  {row.job_location ? <span className="text-mute"> · {row.job_location}</span> : null}
                </p>
                <p className="mt-1 text-[13px] text-mute">
                  Applied {day(row.applied_at)} {row.source === "mms" ? "with MatchMySkillset" : `on ${SOURCE_NAMES[row.job_source ?? ""] ?? "another job site"}`}
                  {checkinLine(row) ? ` · ${checkinLine(row)}` : ""}
                </p>
              </div>
              <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[13px] font-semibold ${TONE[row.status]}`}>{TRACKED_STATUS_LABELS[row.status]}</span>
            </div>
            {controls && <div className="mt-4 border-t border-black/[0.06] pt-4">{controls(row)}</div>}
          </li>
        );
      })}
    </ul>
  );
}
