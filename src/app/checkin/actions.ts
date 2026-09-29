"use server";

// Records the answer from a check-in email, after the person pressed Confirm
// on /checkin. The signed value is checked again here: server actions can be
// called directly, not only from our page.

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/employer/server";
import { verifyCheckin } from "@/lib/tracking/sign";
import { getTracked, setTrackedStatus, stopAllCheckins, stopCheckins } from "@/lib/tracking/tracker";

export async function confirmCheckin(form: FormData): Promise<void> {
  const c = String(form.get("c") ?? "");
  const signed = verifyCheckin(c);
  if (!signed) redirect("/checkin?c=invalid");
  const { allowed } = await checkRateLimit(`checkin:${await requestIp()}`, 60, 3600);
  if (!allowed) redirect(`/checkin?c=${encodeURIComponent(c)}&err=busy`);
  const row = await getTracked(signed.trackedId).catch(() => null);
  if (!row || row === "off") redirect(`/checkin?c=${encodeURIComponent(c)}`);

  let ok: boolean;
  if (signed.answer === "stop") ok = await stopCheckins(row, "checkin");
  else if (signed.answer === "stopall") ok = (await stopAllCheckins(row, "checkin")) >= 0;
  else ok = await setTrackedStatus(row, signed.answer, "checkin");
  if (!ok) redirect(`/checkin?c=${encodeURIComponent(c)}&err=save`);
  redirect(`/tracker/${encodeURIComponent(row.manage_token)}?done=${signed.answer}`);
}
