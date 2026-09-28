import type { ReactNode } from "react";

export interface Step {
  title: ReactNode;
  text: ReactNode;
}

/**
 * Numbered steps with black number discs, as on the WBYI /start page. Use it
 * in a hero column or beside a form. Renders an ordered list, so the numbers
 * are also read out.
 */
export function StepList({ steps, className = "" }: { steps: Step[]; className?: string }) {
  return (
    <ol className={`space-y-5 ${className}`}>
      {steps.map((s, i) => (
        <li key={i} className="flex gap-4">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div>
            <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{s.title}</p>
            <p className="text-[15px] text-mute">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A grey tile for a "how it works" row: "Step n", a title, a line of text and
 * a small product mockup (children) in the lower well. Put three in a
 * `grid gap-5 md:grid-cols-3`.
 */
export function StepTile({
  n,
  title,
  text,
  children,
  headingLevel = 3,
}: {
  n: number;
  title: ReactNode;
  text: ReactNode;
  /** The mockup shown in the tile's lower well. Keep it illustrative. */
  children?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className="tile flex flex-col overflow-hidden p-7">
      <p className="text-[15px] font-semibold text-mute">Step {n}</p>
      <H className="title mt-1">{title}</H>
      <p className="mt-3 text-[17px] leading-snug text-mute">{text}</p>
      {children && (
        <div className="mt-8 flex-1 rounded-[22px] bg-gradient-to-b from-[#ececf0] to-[#e4e4ea] p-4" aria-hidden="true">
          {children}
        </div>
      )}
    </div>
  );
}
