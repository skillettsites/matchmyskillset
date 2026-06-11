import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reports the logged-in user's plan so the client can gate Pro-only features.
// Tier is read from Supabase Auth app_metadata (set by the Stripe webhook).
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ authenticated: false, tier: "free" });
  }

  const meta = data.user.app_metadata || {};
  const tier = meta.tier === "pro" || meta.tier === "premium" ? "pro" : "free";

  return NextResponse.json({
    authenticated: true,
    email: data.user.email || "",
    tier,
  });
}
