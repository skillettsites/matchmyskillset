import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/employer/admin-auth";
import { formatDate } from "@/lib/employer/jobs";
import { Badge, Notice, Stat } from "@/components/employer/ui";
import {
  conversions,
  employerNames,
  filterQuery,
  loadEvents,
  loadFunnel,
  loadPlacements,
  londonToday,
  METRICS,
  percent,
  readFilters,
  type FunnelFilters,
  type Metric,
} from "@/lib/tracking/funnel";
import { fieldLabel, fieldOptions } from "@/lib/tracking/field";
import type { PlacementRow } from "@/lib/tracking/placements";
import { recordAdminPlacement, togglePlacementCancelled } from "../tracking-actions";

// Candidate journey funnel for Dave and Freddie: totals and trends from
// results links to placements, stage conversion rates, filters (dates, field,
// client), the placements list for case studies (with each person's
// case-study consent) and CSV exports of every view. Admin only.

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Funnel and placements", robots: { index: false, follow: false } };

const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }) : "";

const BUCKET_WORD = { day: "Day", week: "Week starting", month: "Month" } as const;

function Num({ value, note }: { value: number | null; note?: string }) {
  return value === null ? <span className="text-[17px] font-medium text-mute">{note ?? "n/a"}</span> : <>{value.toLocaleString("en-GB")}</>;
}

function consentLabel(p: PlacementRow): { text: string; tone: "green" | "grey" | "amber" | "red" } {
  if (p.marketing_consent) return { text: `Yes, ${formatDate(p.marketing_consent_at)}`, tone: "green" };
  if (p.marketing_consent_withdrawn_at) return { text: `Withdrawn ${formatDate(p.marketing_consent_withdrawn_at)}`, tone: "red" };
  if (p.marketing_consent_answered_at) return { text: "Said no", tone: "grey" };
  if (p.consent_requested_at) return { text: "Asked, no answer yet", tone: "amber" };
  if (!p.candidate_email) return { text: "No email to ask", tone: "grey" };
  return { text: p.cancelled_at ? "Not asked" : "Will be asked", tone: "grey" };
}

function presets(f: FunnelFilters) {
  const today = londonToday();
  const back = (days: number) => {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
  };
  return [
    { label: "7 days", from: back(6) },
    { label: "30 days", from: back(29) },
    { label: "90 days", from: back(89) },
    { label: "12 months", from: back(364) },
  ].map((p) => ({ ...p, href: `/admin/funnel?${filterQuery({ ...f, from: p.from, to: today })}`, active: f.from === p.from && f.to === today }));
}

export default async function FunnelPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isAdmin())) {
    return (
      <div className="bg-cloud px-5 py-24">
        <div className="mx-auto max-w-[520px] text-center">
          <h1 className="title">Admin only</h1>
          <p className="mt-3 text-mute">Sign in first.</p>
          <Link href="/admin" className="btn btn-primary mt-6">
            Sign in to admin
          </Link>
        </div>
      </div>
    );
  }
  const sp = await searchParams;
  const f = readFilters(sp);
  const msg = typeof sp.msg === "string" ? sp.msg : null;
  const err = typeof sp.err === "string" ? sp.err : null;
  const [funnel, placements, events, employers] = await Promise.all([loadFunnel(f), loadPlacements(f), loadEvents(f, 100), employerNames()]);
  const employerName = new Map(employers.map((e) => [e.id, e.name]));
  const q = filterQuery(f);
  const exportHref = (view: string) => `/admin/funnel/export?${filterQuery(f, { view })}`;
  const t = funnel.totals;
  const apps = t.applied_mms === null && t.applied_external === null ? null : (t.applied_mms ?? 0) + (t.applied_external ?? 0);
  const stages: { label: string; value: number | null }[] = [
    { label: "Applications", value: apps },
    { label: "Interviews", value: t.interview },
    { label: "Offers", value: t.offer },
    { label: "Placements", value: t.placed },
  ];
  const maxStage = Math.max(1, ...stages.map((s) => s.value ?? 0));
  const trendMetrics: Metric[] = ["results", "optins", "applied_mms", "applied_external", "interview", "offer", "placed"];
  const filtered = Boolean(f.field || f.client);

  return (
    <div className="bg-cloud px-5 pb-24 pt-10">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/admin" className="text-[14px] text-link hover:underline">
          ‹ Admin
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="headline">Funnel and placements</h1>
          <div className="flex flex-wrap gap-2">
            <a href={exportHref("stages")} className="btn btn-secondary btn-sm">
              Export totals (CSV)
            </a>
            <a href={exportHref("trend")} className="btn btn-secondary btn-sm">
              Export trend (CSV)
            </a>
          </div>
        </div>

        {msg && <p className="mt-6 rounded-2xl bg-[#e8f6ec] px-4 py-3 text-[15px] text-[#1d7f37]">{msg}</p>}
        {err && <p className="mt-6 rounded-2xl bg-[#fdecea] px-4 py-3 text-[15px] text-[#8c1d18]">{err}</p>}

        {/* Filters */}
        <form method="get" className="mt-6 grid gap-3 rounded-[22px] bg-white p-5 sm:grid-cols-2 lg:grid-cols-[150px_150px_1fr_1fr_auto_auto] lg:items-end">
          <label className="block">
            <span className="field-label !text-[13px]">From</span>
            <input type="date" name="from" defaultValue={f.from} className="field !py-2 !text-[15px]" />
          </label>
          <label className="block">
            <span className="field-label !text-[13px]">To</span>
            <input type="date" name="to" defaultValue={f.to} className="field !py-2 !text-[15px]" />
          </label>
          <label className="block">
            <span className="field-label !text-[13px]">Field (from the job title)</span>
            <select name="field" defaultValue={f.field ?? ""} className="field !py-2 !text-[15px]">
              <option value="">All fields</option>
              {fieldOptions().map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label !text-[13px]">Client</span>
            <select name="client" defaultValue={f.client ?? ""} className="field !py-2 !text-[15px]">
              <option value="">All clients and outside jobs</option>
              {employers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-[14px] text-ink-2">
            <input type="checkbox" name="test" value="1" defaultChecked={f.includeTest} className="h-4 w-4 accent-[#0071e3]" />
            Include test data
          </label>
          <button type="submit" className="btn btn-primary btn-sm mb-1">
            Show
          </button>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-6">
            {presets(f).map((p) => (
              <Link key={p.label} href={p.href} className={`pill !px-3 !py-1 text-[13px] ${p.active ? "bg-ink text-white" : "bg-cloud text-ink-2"}`}>
                Last {p.label}
              </Link>
            ))}
          </div>
        </form>

        {!funnel.ready && (
          <div className="mt-6">
            <Notice tone="amber">
              Journey tracking is not switched on yet: apply supabase/migrations/010_tracking.sql. Until then only results links, opt-in profiles and applications through
              MatchMySkillset can be counted, and only without a field or client filter.
            </Notice>
          </div>
        )}
        {filtered && funnel.ready && (
          <p className="mt-4 text-[14px] text-mute">
            Filtered{f.field ? ` to ${fieldLabel(f.field)}` : ""}
            {f.client ? `${f.field ? " and" : ""} to ${employerName.get(f.client) ?? "one client"}` : ""}. Results links, profiles, accounts and job packs belong to no job, so
            they are not filtered. A client filter leaves out outside jobs.
          </p>
        )}

        {/* Totals */}
        <h2 className="title mt-10">
          {formatDate(`${f.from}T12:00:00Z`)} to {formatDate(`${f.to}T12:00:00Z`)}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {METRICS.map((m) => (
            <Stat key={m.id} label={m.label} value={<Num value={t[m.id]} note={funnel.notes[m.id]} />} hint={m.hint} />
          ))}
        </div>

        {/* Stage funnel */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[22px] bg-white p-6">
            <h3 className="text-[18px] font-bold tracking-[-0.02em] text-ink">From application to placement</h3>
            <p className="mt-1 text-[13px] text-mute">Each application counts once per stage, the first time it gets there. Applications include outside jobs people told us about.</p>
            <div className="mt-5 space-y-4" role="list">
              {stages.map((s) => (
                <div key={s.label} role="listitem" title={`${s.label}: ${s.value ?? "n/a"}`}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="font-medium text-ink">{s.label}</span>
                    <span className="font-semibold tabular-nums text-ink">{s.value === null ? "n/a" : s.value.toLocaleString("en-GB")}</span>
                  </div>
                  <div className="mt-1.5 h-3 rounded-full bg-cloud" aria-hidden="true">
                    <div className="h-3 rounded-full bg-blue" style={{ width: `${s.value ? Math.max(2, (s.value / maxStage) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] bg-white p-6">
            <h3 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Conversion</h3>
            <table className="mt-3 w-full text-left text-[14px]">
              <tbody>
                {conversions(t).map((c) => (
                  <tr key={c.label} className="border-b border-black/[0.05] last:border-0">
                    <td className="py-2.5 pr-3 text-ink-2">{c.label}</td>
                    <td className="py-2.5 text-right text-mute tabular-nums">{c.from === null || c.to === null ? "" : `${c.to} of ${c.from}`}</td>
                    <td className="py-2.5 pl-3 text-right font-semibold tabular-nums text-ink">{percent(c.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
          <h2 className="title">Trend by {funnel.bucket}</h2>
          <a href={exportHref("trend")} className="text-[14px] text-link hover:underline">
            Download CSV
          </a>
        </div>
        {funnel.ready ? (
          <div className="mt-4 max-h-[520px] overflow-auto rounded-[18px] bg-white">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead className="sticky top-0 bg-white text-[12px] text-mute">
                <tr className="border-b border-black/[0.06]">
                  <th className="px-4 py-3 font-semibold">{BUCKET_WORD[funnel.bucket]}</th>
                  {trendMetrics.map((m) => (
                    <th key={m} className="px-3 py-3 text-right font-semibold">
                      {METRICS.find((x) => x.id === m)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...funnel.trend].reverse().map((row) => (
                  <tr key={row.start} className="border-b border-black/[0.04] last:border-0">
                    <td className="px-4 py-2.5 text-ink-2">{formatDate(`${row.start}T12:00:00Z`)}</td>
                    {trendMetrics.map((m) => (
                      <td key={m} className={`px-3 py-2.5 text-right tabular-nums ${row.values[m] ? "font-semibold text-ink" : "text-mute"}`}>
                        {filtered && !METRICS.find((x) => x.id === m)?.filterable ? "" : (row.values[m] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[15px] text-mute">Trends appear once journey tracking is switched on.</p>
        )}

        {/* Placements */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
          <h2 id="placements" className="title scroll-mt-24">
            Placements
          </h2>
          {placements !== "off" && (
            <a href={exportHref("placements")} className="text-[14px] text-link hover:underline">
              Download CSV
            </a>
          )}
        </div>
        <p className="mt-2 max-w-[860px] text-[14px] text-mute">
          For case studies, marketing and client updates. Only use a placement in marketing when the case-study column says yes, and always anonymously: the person
          agreed to &ldquo;without my name, contact details or anything else that identifies me&rdquo;. We ask them by email about a day after the placement is recorded.
        </p>
        {placements === "off" ? (
          <p className="mt-4 text-[15px] text-mute">Not switched on yet: apply supabase/migrations/010_tracking.sql.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
            <table className="w-full min-w-[980px] text-left text-[14px]">
              <thead className="text-[12px] text-mute">
                <tr className="border-b border-black/[0.06]">
                  <th className="px-4 py-3 font-semibold">Recorded</th>
                  <th className="px-4 py-3 font-semibold">Job</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Field</th>
                  <th className="px-4 py-3 font-semibold">Confirmed by</th>
                  <th className="px-4 py-3 font-semibold">Case study</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {placements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-mute">
                      None in this period.
                    </td>
                  </tr>
                )}
                {placements.map((p) => {
                  const c = consentLabel(p);
                  return (
                    <tr key={p.id} className={`border-b border-black/[0.04] align-top last:border-0 ${p.cancelled_at ? "opacity-55" : ""}`}>
                      <td className="px-4 py-3 text-mute">
                        {when(p.created_at)}
                        {p.started_on ? <span className="block text-[12px]">Started {formatDate(`${p.started_on}T12:00:00Z`)}</span> : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{p.job_title ?? "Job not given"}</span>
                        {p.company ? <span className="block text-[13px] text-mute">{p.company}</span> : null}
                        {p.is_test ? <Badge tone="amber">test</Badge> : null}
                      </td>
                      <td className="px-4 py-3">{p.employer_account_id ? employerName.get(p.employer_account_id) ?? "" : <span className="text-mute">Outside job</span>}</td>
                      <td className="px-4 py-3">{fieldLabel(p.field)}</td>
                      <td className="px-4 py-3">
                        {p.confirmed_by}
                        {p.cancelled_at ? <span className="block text-[12px] text-[#8c1d18]">Cancelled {formatDate(p.cancelled_at)}</span> : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={c.tone}>{c.text}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={togglePlacementCancelled}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="cancel" value={p.cancelled_at ? "0" : "1"} />
                          <input type="hidden" name="keep" value={q} />
                          <button className="text-[13px] text-link hover:underline">{p.cancelled_at ? "Restore" : "Cancel"}</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <details className="mt-4 rounded-[18px] bg-white p-5">
          <summary className="cursor-pointer text-[15px] font-semibold text-ink">Record a placement by hand</summary>
          <form action={recordAdminPlacement} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="keep" value={q} />
            <label className="block md:col-span-2">
              <span className="field-label !text-[13px]">Link to an application (optional)</span>
              <input name="link" className="field !py-2 !text-[15px]" placeholder="app:<application id> or trk:<tracked id> (from the events table below)" maxLength={80} />
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Job title</span>
              <input name="job_title" className="field !py-2 !text-[15px]" maxLength={200} placeholder="Taken from the application if linked" />
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Company</span>
              <input name="company" className="field !py-2 !text-[15px]" maxLength={200} />
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Location</span>
              <input name="location" className="field !py-2 !text-[15px]" maxLength={200} />
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Field</span>
              <select name="field" defaultValue="" className="field !py-2 !text-[15px]">
                <option value="">Work it out from the job title</option>
                {fieldOptions().map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Client (employer account)</span>
              <select name="employer" defaultValue="" className="field !py-2 !text-[15px]">
                <option value="">None or not on the site</option>
                {employers.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label !text-[13px]">Start date (optional)</span>
              <input type="date" name="started_on" className="field !py-2 !text-[15px]" />
            </label>
            <label className="block md:col-span-2">
              <span className="field-label !text-[13px]">Their email (optional: only to ask about case studies)</span>
              <input type="email" name="email" className="field !py-2 !text-[15px]" maxLength={254} />
            </label>
            <label className="block md:col-span-2">
              <span className="field-label !text-[13px]">Note (only admin sees this)</span>
              <textarea name="note" className="field min-h-[70px] !text-[15px]" maxLength={1000} />
            </label>
            <div className="md:col-span-2">
              <button className="btn btn-dark btn-sm">Record placement</button>
            </div>
          </form>
        </details>

        {/* Events */}
        <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
          <h2 className="title">Latest journey events</h2>
          {events !== "off" && (
            <a href={exportHref("events")} className="text-[14px] text-link hover:underline">
              Download CSV (up to 5,000)
            </a>
          )}
        </div>
        <p className="mt-2 text-[14px] text-mute">No names or email addresses are kept here. The last 100 in this period.</p>
        {events === "off" ? (
          <p className="mt-4 text-[15px] text-mute">Not switched on yet: apply supabase/migrations/010_tracking.sql.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="text-[12px] text-mute">
                <tr className="border-b border-black/[0.06]">
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">What</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">By</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Field</th>
                  <th className="px-4 py-3 font-semibold">Link id</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-mute">
                      None in this period.
                    </td>
                  </tr>
                )}
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-black/[0.04] last:border-0">
                    <td className="px-4 py-2.5 text-mute">{when(e.created_at)}</td>
                    <td className="px-4 py-2.5">
                      {e.kind.replace(/_/g, " ")}
                      {e.is_test ? <span className="ml-1.5 text-[11px] font-semibold text-[#8a5300]">test</span> : null}
                    </td>
                    <td className="px-4 py-2.5">{e.status ?? ""}</td>
                    <td className="px-4 py-2.5">{e.source}</td>
                    <td className="px-4 py-2.5">{e.channel ?? ""}</td>
                    <td className="px-4 py-2.5">{e.field ? fieldLabel(e.field) : ""}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-mute">{e.application_id ? `app:${e.application_id}` : e.tracked_id ? `trk:${e.tracked_id}` : e.placement_id ? `plc:${e.placement_id}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
