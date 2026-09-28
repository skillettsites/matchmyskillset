import { SITE_NAME } from "@/components/site";

/**
 * The brand mark: two overlapping rings on a teal-to-violet rounded square.
 * One ring is your skills, the other is the job; the overlap is the match.
 * Decorative, so it is hidden from assistive technology.
 */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id="mms-mark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12b5a4" />
          <stop offset="0.5" stopColor="#0a7cff" />
          <stop offset="1" stopColor="#7d4cdb" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mms-mark)" />
      <circle cx="15.5" cy="20" r="7.4" fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="3.4" />
      <circle cx="24.5" cy="20" r="7.4" fill="none" stroke="#fff" strokeWidth="3.4" />
    </svg>
  );
}

/** Mark plus wordmark. The name is real text, so it reads for search engines and screen readers. */
export function Logo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={26} />
      <span className={`text-[17px] font-semibold tracking-[-0.022em] ${tone === "dark" ? "text-white" : "text-ink"}`}>{SITE_NAME}</span>
    </span>
  );
}
