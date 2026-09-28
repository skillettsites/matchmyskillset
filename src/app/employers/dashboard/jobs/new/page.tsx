import type { Metadata } from "next";
import { JobForm, EMPTY_JOB } from "@/components/employer/JobForm";
import { PageHead } from "@/components/employer/ui";
import { requireEmployer } from "@/lib/employer/session";
import { listingBlocker } from "@/lib/employer/jobs";

export const metadata: Metadata = { title: "Post a job", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const account = await requireEmployer();
  const blocker = await listingBlocker(account);
  return (
    <div>
      <PageHead title="Post a job" back={{ href: "/employers/dashboard", label: "All jobs" }}>
        Posting as <strong className="text-ink">{account.company_name}</strong>. You can save a draft at any point.
      </PageHead>
      <JobForm initial={EMPTY_JOB} canSubmit={!blocker} blocker={blocker} />
    </div>
  );
}
