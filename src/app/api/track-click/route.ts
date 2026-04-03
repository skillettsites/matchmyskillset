import { NextRequest, NextResponse } from "next/server";

// In-memory click log (will move to Supabase once configured)
const clickLog: { source: string; jobId: string; title: string; timestamp: string }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { source, jobId, jobTitle, jobUrl } = await request.json();

    // Fire-and-forget logging
    clickLog.push({
      source: source || "unknown",
      jobId: jobId || "unknown",
      title: jobTitle || "unknown",
      timestamp: new Date().toISOString(),
    });

    // Keep log manageable
    if (clickLog.length > 10000) {
      clickLog.splice(0, 5000);
    }

    console.log(
      `[click] ${source} | ${jobTitle} | ${jobUrl?.slice(0, 80)}`
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail on tracking
  }
}
