"use server";

// Changes made on a private tracker page (/tracker/<token>). Each action
// re-checks that the row belongs to that tracker: server actions can be called
// directly, not only from our forms.

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestIp, isUuid } from "@/lib/employer/server";
import { TRACKER_TOKEN_RE } from "@/lib/tracking/sign";
import { isTrackedStatus } from "@/lib/tracking/constants";
import { deleteTracker, deleteTrackedRow, setTrackedStatus, stopAllCheckins, stopCheckins, trackerRows, type TrackedRow } from "@/lib/tracking/tracker";

function back(token: string, notice: string): never {
  redirect(`/tracker/${encodeURIComponent(token)}?done=${notice}`);
}

async function load(form: FormData): Promise<{ token: string; row: TrackedRow | null; rows: TrackedRow[] }> {
  const token = String(form.get("token") ?? "");
  if (!TRACKER_TOKEN_RE.test(token)) redirect("/");
  const { allowed } = await checkRateLimit(`tracker-edit:${await requestIp()}`, 120, 3600);
  if (!allowed) back(token, "busy");
  const rows = await trackerRows(token).catch(() => "off" as const);
  if (rows === "off") back(token, "error");
  const id = String(form.get("id") ?? "");
  const row = isUuid(id) ? (rows.find((r) => r.id === id) ?? null) : null;
  return { token, row, rows };
}

export async function updateTrackedStatus(form: FormData): Promise<void> {
  const { token, row } = await load(form);
  const status = String(form.get("status") ?? "");
  if (!row || !isTrackedStatus(status)) back(token, "error");
  if (row.status === status) back(token, "unchanged");
  const ok = await setTrackedStatus(row, status, "tracker");
  back(token, ok ? "saved" : "error");
}

export async function stopTrackedCheckins(form: FormData): Promise<void> {
  const { token, row } = await load(form);
  if (!row) back(token, "error");
  back(token, (await stopCheckins(row, "tracker")) ? "stop" : "error");
}

export async function stopEveryCheckin(form: FormData): Promise<void> {
  const { token, rows } = await load(form);
  if (!rows[0]) back(token, "error");
  back(token, (await stopAllCheckins(rows[0], "tracker")) >= 0 ? "stopall" : "error");
}

export async function removeTrackedRow(form: FormData): Promise<void> {
  const { token, row } = await load(form);
  if (!row) back(token, "error");
  back(token, (await deleteTrackedRow(token, row.id)) ? "deleted" : "error");
}

export async function removeWholeTracker(form: FormData): Promise<void> {
  const { token } = await load(form);
  if (form.get("confirm") !== "yes") back(token, "confirm");
  const n = await deleteTracker(token);
  if (n < 0) back(token, "error");
  redirect("/tracker/deleted");
}
