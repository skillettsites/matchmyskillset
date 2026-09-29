"use server";

// Saves a job seeker's answer to "Can we mention your move, anonymised, in
// our case studies?". The box on the page is unticked; only a ticked box and
// "Save my answer" counts as yes. Re-checks the token: server actions can be
// called directly.

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/employer/server";
import { getPlacementByConsentToken, setMarketingConsent } from "@/lib/tracking/placements";
import { TRACKER_TOKEN_RE } from "@/lib/tracking/sign";

export async function saveCaseStudyAnswer(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  if (!TRACKER_TOKEN_RE.test(token)) redirect("/");
  const { allowed } = await checkRateLimit(`placement-consent:${await requestIp()}`, 30, 3600);
  if (!allowed) redirect(`/placement/${encodeURIComponent(token)}?done=busy`);
  const p = await getPlacementByConsentToken(token);
  if (!p || p === "off") redirect(`/placement/${encodeURIComponent(token)}`);
  const yes = form.get("consent") === "yes";
  const ok = await setMarketingConsent(p, yes);
  redirect(`/placement/${encodeURIComponent(token)}?done=${ok ? (yes ? "yes" : "no") : "error"}`);
}
