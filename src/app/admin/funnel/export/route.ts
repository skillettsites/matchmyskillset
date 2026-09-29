import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/employer/admin-auth";
import { conversions, employerNames, loadEvents, loadFunnel, loadPlacements, METRICS, percent, readFilters, toCsv } from "@/lib/tracking/funnel";
import { fieldLabel } from "@/lib/tracking/field";

// CSV exports of the admin funnel views, built on the server for a signed-in
// admin only: ?view=stages|trend|placements|events plus the page's filters.
// Placements carry no email address or name: case studies must stay
// anonymous, and the consent columns say whether one may be used at all.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

function csv(name: string, body: string) {
  return new NextResponse(`﻿${body}`, {
    headers: { ...HEADERS, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
  });
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin only" }, { status: 401, headers: HEADERS });
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const f = readFilters(params);
  const view = params.view;
  const stamp = `${f.from}_to_${f.to}${f.field ? `_${f.field}` : ""}${f.client ? "_client" : ""}`;

  if (view === "stages") {
    const data = await loadFunnel(f);
    const rows: unknown[][] = METRICS.map((m) => [m.label, data.totals[m.id] ?? "", data.notes[m.id] ?? ""]);
    rows.push([]);
    for (const c of conversions(data.totals)) rows.push([c.label, c.rate === null ? "" : percent(c.rate), c.from === null || c.to === null ? "" : `${c.to} of ${c.from}`]);
    return csv(`mms-funnel-totals_${stamp}.csv`, toCsv(["Measure", "Value", "Note"], rows));
  }

  if (view === "trend") {
    const data = await loadFunnel(f);
    if (!data.ready) return NextResponse.json({ error: "Journey tracking is not switched on yet (migration 010)." }, { status: 409, headers: HEADERS });
    const metrics = METRICS.filter((m) => m.id !== "accounts" && m.id !== "cv_tools");
    const rows = data.trend.map((t) => [t.start, ...metrics.map((m) => t.values[m.id] ?? 0)]);
    return csv(`mms-funnel-trend-by-${data.bucket}_${stamp}.csv`, toCsv([`${data.bucket} starting`, ...metrics.map((m) => m.label)], rows));
  }

  if (view === "placements") {
    const [placements, employers] = await Promise.all([loadPlacements(f), employerNames()]);
    if (placements === "off") return NextResponse.json({ error: "Placements are not switched on yet (migration 010)." }, { status: 409, headers: HEADERS });
    const names = new Map(employers.map((e) => [e.id, e.name]));
    const rows = placements.map((p) => [
      p.created_at,
      p.job_title ?? "",
      p.company ?? "",
      p.job_location ?? "",
      p.employer_account_id ? (names.get(p.employer_account_id) ?? p.employer_account_id) : "Outside job",
      fieldLabel(p.field),
      p.source,
      p.confirmed_by,
      p.started_on ?? "",
      p.cancelled_at ?? "",
      p.marketing_consent ? "yes" : "no",
      p.marketing_consent_at ?? "",
      p.marketing_consent ? (p.marketing_consent_text ?? "") : "",
      p.marketing_consent_withdrawn_at ?? "",
      p.consent_requested_at ?? "",
      p.is_test ? "yes" : "",
      p.id,
    ]);
    return csv(
      `mms-placements_${stamp}.csv`,
      toCsv(
        [
          "Recorded",
          "Job title",
          "Company",
          "Location",
          "Client",
          "Field",
          "Recorded by",
          "Confirmed by",
          "Started",
          "Cancelled",
          "Case-study consent",
          "Consent given",
          "Consent wording",
          "Consent withdrawn",
          "Consent asked",
          "Test",
          "Placement id",
        ],
        rows
      )
    );
  }

  if (view === "events") {
    const events = await loadEvents(f, 5000);
    if (events === "off") return NextResponse.json({ error: "Journey tracking is not switched on yet (migration 010)." }, { status: 409, headers: HEADERS });
    const rows = events.map((e) => [e.created_at, e.kind, e.status ?? "", e.source, e.channel ?? "", e.field ?? "", e.application_id ?? "", e.tracked_id ?? "", e.placement_id ?? "", e.job_id ?? "", e.account_id ?? "", e.is_test ? "yes" : "", e.detail ?? ""]);
    return csv(
      `mms-journey-events_${stamp}.csv`,
      toCsv(["When", "Kind", "Status", "By", "Channel", "Field", "Application id", "Tracked id", "Placement id", "Job id", "Employer account id", "Test", "Detail"], rows)
    );
  }

  return NextResponse.json({ error: "Say which view: stages, trend, placements or events." }, { status: 400, headers: HEADERS });
}
