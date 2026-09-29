// The board an advert comes from, on job cards and job pages.
// Adzuna's API terms: "label each displayed advert with the phrase 'Jobs by
// Adzuna' at least 116 X 23 pixels in size" (developer.adzuna.com terms of
// service, checked 29 September 2026).

export function SourceBadge({ source, label }: { source: string; label: string }) {
  if (source === "mms") return <span className="pill !px-2.5 !py-0.5 bg-blue text-[12px] text-white">Posted on MatchMySkillset</span>;
  if (source === "adzuna") {
    return <span className="inline-flex h-6 min-w-[120px] items-center justify-center rounded-full bg-cloud px-3 text-[13px] font-semibold text-ink-2">Jobs by Adzuna</span>;
  }
  return <span className="pill !px-2.5 !py-0.5 bg-cloud text-[12px] text-ink-2">{label}</span>;
}
