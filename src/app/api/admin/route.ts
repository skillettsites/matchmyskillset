import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch all data in parallel
    const [leadsRes, assessmentsRes, clicksRes, logsRes] = await Promise.all([
      supabase
        .from("mms_email_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("mms_skill_assessments")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("mms_job_clicks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("mms_search_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    // Compute click stats by source
    const clicksBySource: Record<string, number> = {};
    (clicksRes.data || []).forEach((c: { source: string }) => {
      clicksBySource[c.source] = (clicksBySource[c.source] || 0) + 1;
    });

    // Compute popular career matches from leads
    const matchCounts: Record<string, number> = {};
    (leadsRes.data || []).forEach((l: { top_match: string | null }) => {
      if (l.top_match) {
        matchCounts[l.top_match] = (matchCounts[l.top_match] || 0) + 1;
      }
    });
    const popularMatches = Object.entries(matchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));

    return NextResponse.json({
      leads: leadsRes.data || [],
      totalAssessments: assessmentsRes.data?.length || 0,
      totalLeads: leadsRes.data?.length || 0,
      totalClicks: clicksRes.data?.length || 0,
      totalSearches: logsRes.data?.length || 0,
      clicksBySource,
      popularMatches,
    });
  } catch (error) {
    console.error("[admin] Error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}
