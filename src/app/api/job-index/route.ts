import { NextResponse } from "next/server";
import { getJobIndex } from "@/lib/skills/job-lookup";

// The list of job titles for "start from your job title" on the CV card:
// our 159 careers plus common starting jobs, with the other names people use.
// Static: built once at build time and cached by the browser for a day.

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    { index: getJobIndex() },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
