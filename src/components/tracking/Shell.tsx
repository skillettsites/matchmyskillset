import type { ReactNode } from "react";

/** The page frame for the tracker, check-in and case-study pages: a soft glow and a narrow column. */
export function TrackingShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-50%] !opacity-[0.12]" aria-hidden="true" />
      <div className={`relative mx-auto ${wide ? "max-w-[880px]" : "max-w-[720px]"} px-4 pb-20 pt-12 sm:px-6 md:pt-16`}>{children}</div>
    </div>
  );
}

export function NotOn({ what }: { what: string }) {
  return (
    <TrackingShell>
      <p className="eyebrow text-blue">{what}</p>
      <h1 className="headline mt-2 !text-[36px] sm:!text-[48px]">Not switched on yet</h1>
      <p className="lede mt-4 !text-[19px]">Application tracking is not switched on yet. Please try this link again later.</p>
    </TrackingShell>
  );
}
