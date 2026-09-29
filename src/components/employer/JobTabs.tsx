import Link from "next/link";

// Tabs across the pages of one job in the dashboard.
export function JobTabs({
  jobId,
  active,
  applicants,
  shortlistReady,
}: {
  jobId: string;
  active: "overview" | "applicants" | "candidates" | "shortlist" | "gap" | "edit";
  applicants?: number;
  /** A recruiter shortlist has been sent for this job. */
  shortlistReady?: boolean;
}) {
  const base = `/employers/dashboard/jobs/${jobId}`;
  const tabs = [
    { key: "overview", href: base, label: "Overview" },
    { key: "applicants", href: `${base}/applicants`, label: applicants ? `Applicants (${applicants})` : "Applicants" },
    { key: "candidates", href: `${base}/candidates`, label: "Matched candidates" },
    { key: "shortlist", href: `${base}/shortlist`, label: shortlistReady ? "Recruiter shortlist (ready)" : "Recruiter shortlist" },
    { key: "gap", href: `${base}/skills-gap`, label: "Skills gap" },
    { key: "edit", href: `${base}/edit`, label: "Edit" },
  ] as const;
  return (
    <nav aria-label="This job" className="-mx-5 mb-8 overflow-x-auto px-5 [scrollbar-width:none]">
      <div className="flex gap-1 whitespace-nowrap border-b border-black/[0.08]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active === t.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-3 text-[15px] font-medium ${active === t.key ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
