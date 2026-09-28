import Link from "next/link";
import type { ReactNode } from "react";
import { HeroGlow } from "./HeroGlow";
import { MoreLink } from "./Section";

export interface CtaLink {
  href: string;
  label: string;
}

/**
 * The closing call to action. `glow` is a white band with the soft colour
 * glow behind a big centred line (the WBYI "What would you build?" band);
 * `dark` is a black band for a second audience, such as employers.
 */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
  tone = "glow",
  headingLevel = 2,
  className = "",
}: {
  title: ReactNode;
  text?: ReactNode;
  primary: CtaLink;
  secondary?: CtaLink;
  tone?: "glow" | "dark";
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const dark = tone === "dark";
  return (
    <section
      className={`relative overflow-hidden px-4 py-24 text-center sm:px-6 md:py-32 ${dark ? "on-dark bg-black text-white" : "bg-white"} ${className}`}
    >
      {!dark && <HeroGlow top="20%" opacity={0.16} />}
      <div className="relative mx-auto max-w-[760px]">
        <H className="display">{title}</H>
        {text && <p className={`lede mx-auto mt-5 max-w-[560px] ${dark ? "!text-[#a1a1a6]" : ""}`}>{text}</p>}
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link href={primary.href} className="btn btn-primary btn-lg">
            {primary.label}
          </Link>
          {secondary && (
            <MoreLink href={secondary.href} light={dark}>
              {secondary.label}
            </MoreLink>
          )}
        </div>
      </div>
    </section>
  );
}
