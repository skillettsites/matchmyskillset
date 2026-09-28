import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "./Icons";

export interface Feature {
  icon: ReactNode;
  title: ReactNode;
  text: ReactNode;
  /** Tailwind gradient stops for the icon square, e.g. "from-[#0a84ff] to-[#5e5ce6]". */
  grad?: string;
  /** Makes the whole tile a link. */
  href?: string;
  /** Link hint at the foot of a linked tile. */
  linkLabel?: string;
}

/** Gradient pairs in the house palette, used in order when a feature has no `grad`. */
export const TILE_GRADIENTS = [
  "from-[#12b5a4] to-[#0a7cff]",
  "from-[#0a84ff] to-[#5e5ce6]",
  "from-[#5e5ce6] to-[#bf5af2]",
  "from-[#30d158] to-[#12b5a4]",
  "from-[#ff9f0a] to-[#ff375f]",
  "from-[#64d2ff] to-[#0a84ff]",
];

/**
 * Bento-style feature tiles: gradient icon square, title, one or two lines of
 * text. `surface="white"` on a cloud band, `"cloud"` on a white one.
 */
export function FeatureTiles({
  items,
  surface = "white",
  columns = 3,
  headingLevel = 3,
  className = "",
}: {
  items: Feature[];
  surface?: "white" | "cloud";
  columns?: 2 | 3 | 4;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  const bg = surface === "white" ? "bg-white" : "bg-cloud";
  return (
    <ul className={`grid gap-4 ${cols} ${className}`}>
      {items.map((f, i) => {
        const body = (
          <>
            <div
              className={`grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br ${f.grad ?? TILE_GRADIENTS[i % TILE_GRADIENTS.length]} text-white [&_svg]:h-6 [&_svg]:w-6`}
              aria-hidden="true"
            >
              {f.icon}
            </div>
            <H className="mt-6 text-[22px] font-bold leading-tight tracking-[-0.03em] text-ink">{f.title}</H>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">{f.text}</p>
            {f.href && (
              <p className="mt-auto inline-flex items-center gap-0.5 pt-5 text-[15px] text-link group-hover:underline">
                {f.linkLabel ?? "Learn more"}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </p>
            )}
          </>
        );
        return (
          <li key={i} className="flex">
            {f.href ? (
              <Link href={f.href} className={`group flex w-full flex-col rounded-[28px] ${bg} p-7 transition-transform duration-300 hover:scale-[1.01]`}>
                {body}
              </Link>
            ) : (
              <div className={`flex w-full flex-col rounded-[28px] ${bg} p-7`}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
