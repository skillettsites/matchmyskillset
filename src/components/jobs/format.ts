// Shared by server and client components.

/** "Posted today", "Posted 3 days ago", "Posted 2 weeks ago", or the date for older adverts. */
export function postedLabel(iso?: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 60) return `Posted ${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  return `Posted ${new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

/** A down chevron for <select class="field"> (the field style removes the native arrow). */
export const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e73' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  backgroundSize: "16px",
  paddingRight: "40px",
} as const;
