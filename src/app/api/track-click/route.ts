import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { source, jobId, jobTitle, jobUrl } = await request.json();

    // Fire-and-forget to Supabase
    try {
      const supabase = createAdminClient();
      supabase
        .from("mms_job_clicks")
        .insert({
          source: source || "unknown",
          job_external_id: jobId || null,
          job_title: jobTitle || null,
          job_url: jobUrl || null,
        })
        .then(({ error }) => {
          if (error) console.error("[click] Supabase error:", error.message);
        });
    } catch {
      // Supabase not configured, ignore
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
