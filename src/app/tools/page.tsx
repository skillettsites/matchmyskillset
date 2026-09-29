import type { Metadata } from "next";
import Link from "next/link";
import { PACK_PRICE_LABEL, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL } from "@/lib/candidate/plans";

export const metadata: Metadata = {
  title: "CV tools: tailor your CV and check any job",
  description: `Rewrite your own CV for one job, with a cover letter and interview prep, or check how well you match any advert. Your first tailored CV is free; then ${PACK_PRICE_LABEL} a job or Plus at ${PLUS_PRICE_LABEL} a month.`,
  alternates: { canonical: "/tools" },
};

function Tile({ eyebrow, title, text, note, href, cta, gradient }: { eyebrow: string; title: string; text: string; note: string; href: string; cta: string; gradient: string }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-cloud p-7 sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl" style={{ background: gradient }} aria-hidden="true" />
      <p className="eyebrow relative text-link">{eyebrow}</p>
      <h2 className="relative mt-2 text-[32px] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[40px]">{title}</h2>
      <p className="relative mt-4 flex-1 text-[17px] leading-relaxed text-ink-2">{text}</p>
      <p className="relative mt-4 text-[14px] text-mute">{note}</p>
      <div className="relative mt-6">
        <Link href={href} className="btn btn-primary">
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-12 pt-14 sm:px-6 md:pt-20">
        <div className="hero-glow top-[-20%] !opacity-[0.16]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[900px] text-center">
          <p className="eyebrow rise text-blue">CV tools</p>
          <h1 className="display rise rise-1 mt-3">
            Apply with a CV that <span className="gradient-text">fits the job.</span>
          </h1>
          <p className="lede rise rise-2 mx-auto mt-5 max-w-[640px]">
            Built from your own CV, never made up. Anything an advert asks for that your CV does not show is listed as a gap, not added.
          </p>
        </div>
      </section>
      <section aria-label="Tools" className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-[1080px] gap-5 md:grid-cols-2">
          <Tile
            eyebrow="Tailor my CV"
            title="Your CV, rewritten for one job."
            text="Pick one of your matched jobs or paste any advert. You get your CV rewritten to lead with what the employer asks for, a cover letter, and likely interview questions with answers drawn from your CV. Edit everything, then download Word or PDF."
            note={`Your first tailored CV is free. Then ${PACK_PRICE_LABEL} a job, or up to ${PLUS_PACKS_PER_MONTH} a month with Plus.`}
            href="/tools/tailor"
            cta="Tailor my CV"
            gradient="linear-gradient(135deg,#0071e3,#8a5cdf)"
          />
          <Tile
            eyebrow="Check any job"
            title="See your match for any advert."
            text="Found a job somewhere else? Paste the advert and see your match and the skills it asks for that your CV does not show, scored the same way as the jobs on your results page. No AI guesswork: the same CV and advert always get the same score."
            note={`Part of Plus, ${PLUS_PRICE_LABEL} a month.`}
            href="/tools/check"
            cta="Check a job"
            gradient="linear-gradient(135deg,#34c759,#0071e3)"
          />
        </div>
        <p className="mx-auto mt-8 max-w-[760px] text-center text-[15px] text-mute">
          Finding jobs that match your CV is free, with no account.{" "}
          <Link href="/plus" className="text-link hover:underline">
            Compare free, job packs and Plus
          </Link>
        </p>
      </section>
    </div>
  );
}
