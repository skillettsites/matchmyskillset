import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "./Icons";

const TONES = {
  white: "bg-white",
  cloud: "bg-cloud",
  dark: "on-dark bg-black text-white",
} as const;

const WIDTHS = {
  narrow: "max-w-[880px]",
  default: "max-w-[1080px]",
} as const;

/**
 * A full-width page band with the standard padding and a centred container.
 * Alternate `white` and `cloud`; use `dark` once per page at most.
 */
export function Section({
  children,
  tone = "white",
  width = "default",
  id,
  labelledBy,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  width?: keyof typeof WIDTHS;
  id?: string;
  /** id of the section heading, for aria-labelledby. */
  labelledBy?: string;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`px-4 py-20 sm:px-6 md:py-28 ${TONES[tone]} ${className}`}>
      <div className={`mx-auto ${WIDTHS[width]}`}>{children}</div>
    </section>
  );
}

/** "Learn more >" text link in the blue link colour. `light` for dark bands. */
export function MoreLink({
  href,
  children,
  light = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`link-more ${light ? "!text-[#2997ff]" : ""} ${className}`}>
      {children}
      <ChevronRight />
    </Link>
  );
}

/** Eyebrow + headline + optional lede, left aligned or centred. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = "left",
  eyebrowClassName = "text-link",
  as: Tag = "h2",
  className = "",
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  /** Colour for the eyebrow. Default text-link (5.1:1 even on cloud); text-blue is fine on plain white. */
  eyebrowClassName?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto max-w-[760px] text-center" : "max-w-[720px]"} ${className}`}>
      {eyebrow && <p className={`eyebrow ${eyebrowClassName}`}>{eyebrow}</p>}
      <Tag id={id} className={`headline ${eyebrow ? "mt-2" : ""}`}>
        {title}
      </Tag>
      {lede && <p className={`mt-5 text-[19px] leading-snug text-mute ${center ? "mx-auto max-w-[620px]" : "max-w-[620px]"}`}>{lede}</p>}
    </div>
  );
}
