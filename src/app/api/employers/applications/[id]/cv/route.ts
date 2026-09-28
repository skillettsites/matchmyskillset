import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmployer } from "@/lib/employer/session";
import { getAccountJob } from "@/lib/employer/jobs";
import { isUuid } from "@/lib/employer/server";

// Downloads an applicant's CV as plain text, only for the employer whose job
// they applied to.

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await getEmployer();
  if (!account) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: HEADERS });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404, headers: HEADERS });

  const { data } = await createAdminClient()
    .from("mms_applications")
    .select("id, job_id, name, email, phone, cv_text, created_at")
    .eq("id", id)
    .maybeSingle();
  const job = data ? await getAccountJob(account.id, data.job_id) : null;
  if (!data || !job) return NextResponse.json({ error: "Not found" }, { status: 404, headers: HEADERS });

  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Applied for: ${job.title} (${job.company_name})`,
    `Applied on: ${new Date(data.created_at).toLocaleDateString("en-GB", { timeZone: "Europe/London" })}`,
    "",
    "Shared through MatchMySkillset with the applicant's consent, for this role only.",
    "",
    "----",
    "",
    data.cv_text || "(No CV text was included.)",
  ].filter((l): l is string => l !== null);
  const safeName = data.name.replace(/[^A-Za-z0-9 _-]+/g, "").trim().slice(0, 60) || "applicant";

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      ...HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="CV - ${safeName}.txt"`,
    },
  });
}
