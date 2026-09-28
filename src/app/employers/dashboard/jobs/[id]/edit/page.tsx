import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobForm } from "@/components/employer/JobForm";
import { JobTabs } from "@/components/employer/JobTabs";
import { PageHead } from "@/components/employer/ui";
import { requireEmployer } from "@/lib/employer/session";
import { getAccountJob, listingBlocker } from "@/lib/employer/jobs";
import { isUuid } from "@/lib/employer/server";

export const metadata: Metadata = { title: "Edit job", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const account = await requireEmployer();
  const { id } = await params;
  const job = isUuid(id) ? await getAccountJob(account.id, id) : null;
  if (!job) notFound();
  const blocker = await listingBlocker(account, job.id);
  const money = (n: number | null) => (n === null || n === undefined ? "" : String(n));
  return (
    <div>
      <PageHead title={job.title} eyebrow="Edit job" back={{ href: "/employers/dashboard", label: "All jobs" }} />
      <JobTabs jobId={job.id} active="edit" />
      <JobForm
        initial={{
          id: job.id,
          status: job.status,
          title: job.title,
          location: job.location ?? "",
          remote: job.remote,
          salary_min: money(job.salary_min),
          salary_max: money(job.salary_max),
          salary_period: job.salary_period ?? "year",
          contract_type: job.contract_type ?? "permanent",
          hours: job.hours ?? "full_time",
          description: job.description,
          apply_method: job.apply_method,
          apply_url: job.apply_url ?? "",
          apply_email: job.apply_email ?? "",
        }}
        canSubmit={!blocker}
        blocker={blocker}
      />
    </div>
  );
}
