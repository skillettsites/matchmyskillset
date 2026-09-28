import Link from "next/link";
import type { ReactNode } from "react";

// Small presentational pieces shared by the dashboard and admin pages.

const TONES = {
  grey: "bg-cloud text-ink-2",
  amber: "bg-[#fff4e0] text-[#8a5300]",
  green: "bg-[#e8f6ec] text-[#1d7f37]",
  red: "bg-[#fdecea] text-[#8c1d18]",
  blue: "bg-[#e8f1fd] text-[#0058b0]",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone = "grey", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${TONES[tone]}`}>{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-[22px] bg-white p-5">
      <p className="text-[13px] text-mute">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[12px] text-mute">{hint}</p>}
    </div>
  );
}

export function Notice({ tone = "blue", children }: { tone?: Tone; children: ReactNode }) {
  return <div className={`rounded-[18px] px-5 py-4 text-[15px] leading-snug ${TONES[tone]}`}>{children}</div>;
}

export function SkillChip({ name, match = false }: { name: string; match?: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${match ? "bg-[#e8f1fd] text-[#0058b0]" : "bg-cloud text-ink-2"}`}>
      {name}
    </span>
  );
}

export function MatchBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-cloud" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-[#0071e3] to-[#7d4cdb]" style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
      </div>
      <span className="w-[86px] shrink-0 text-right text-[14px] font-bold text-ink">{score}% match</span>
    </div>
  );
}

export function PageHead({ eyebrow, title, children, back }: { eyebrow?: string; title: string; children?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-[14px] text-link hover:underline">
          ‹ {back.label}
        </Link>
      )}
      {eyebrow && <p className={`text-[14px] font-semibold text-mute ${back ? "mt-3" : ""}`}>{eyebrow}</p>}
      <h1 className={`title ${eyebrow || back ? "mt-1" : ""} !text-[30px] sm:!text-[36px]`}>{title}</h1>
      {children && <div className="mt-3 text-[16px] leading-snug text-mute">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-12 text-center">
      <p className="text-[21px] font-bold tracking-[-0.02em] text-ink">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-[15px] leading-snug text-mute">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
