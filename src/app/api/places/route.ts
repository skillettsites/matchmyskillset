import { NextRequest, NextResponse } from "next/server";
import { isSameSiteRequest } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { cleanText } from "@/lib/input";
import { suggestPlaces } from "@/lib/apis/jobs/location";

// UK town and city suggestions for the location box on the CV card, from
// postcodes.io (OS Open Names), cached for 30 days per prefix. What is typed
// goes to postcodes.io through our server, never from the browser.

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isSameSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const q = cleanText(request.nextUrl.searchParams.get("q"), 40);
  if (q.length < 2 || /\d/.test(q)) return NextResponse.json({ suggestions: [] });
  const { allowed } = await checkRateLimit(`places:${clientIp(request)}`, 120, 600);
  if (!allowed) return NextResponse.json({ suggestions: [] }, { status: 429 });
  try {
    const suggestions = await suggestPlaces(q);
    return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.warn("[places] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ suggestions: [] });
  }
}
