import { SITE_NAME } from "@/components/site";

/** Props for {@link RouteMark} and {@link Logo}. */
export interface LogoProps {
  /** `light` for paper backgrounds (default), `dark` for the night footer. */
  tone?: "light" | "dark";
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * The brand mark: a route from an open ring (the job you do now) to a solid
 * dot (where you could go), with an amber core for the pay figure.
 * Decorative, so it is hidden from assistive technology.
 */
export function RouteMark({ tone = "light", className = "" }: LogoProps) {
  const ring = tone === "dark" ? "#e9e3d6" : "#18201d";
  const path = tone === "dark" ? "#7fb89f" : "#1b5e4b";
  const fill = tone === "dark" ? "#14231e" : "#f7f3ea";
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={`h-8 w-8 shrink-0 ${className}`}
    >
      <path
        d="M8 16.4C8 11.6 11.6 8 16.4 8"
        fill="none"
        stroke={path}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="0.01 4.15"
      />
      <circle cx="8" cy="24" r="4.25" fill={fill} stroke={ring} strokeWidth="2.5" />
      <circle cx="24" cy="8" r="5.5" fill={path} />
      <circle cx="24" cy="8" r="2" fill="#e0a030" />
    </svg>
  );
}

/**
 * Mark plus wordmark. The wordmark is real text in the serif, so the brand
 * name is readable by search engines and screen readers.
 */
export function Logo({ tone = "light", className = "" }: LogoProps) {
  const text = tone === "dark" ? "text-night-text" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <RouteMark tone={tone} />
      <span
        className={`font-serif text-[1.3125rem] font-semibold leading-none tracking-[-0.02em] ${text}`}
      >
        {SITE_NAME}
      </span>
    </span>
  );
}
