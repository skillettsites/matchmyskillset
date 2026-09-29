import type { Metadata } from "next";
import Link from "next/link";
import { CvUploadCard } from "@/components/cv/CvUploadCard";
import { JsonLd } from "@/components/JsonLd";
import { formatGBP } from "@/components/content";
import { AsheSourceNote, occupationPayById } from "@/components/guides/pay";
import {
  CtaBand,
  EmployerMockup,
  Faq,
  HeroGlow,
  MoreLink,
  ResultsMockup,
  SectionHeading,
  StepList,
  StepTile,
  faqJsonLd,
  type FaqItem,
} from "@/components/marketing";
import { Check, ChevronRight } from "@/components/marketing/Icons";
import { ENGINEERING_HUBS, OTHER_CAREER_HUBS } from "@/components/site";
import { REPORT_PRICE_LABEL } from "@/lib/apis/report-product";

export const metadata: Metadata = {
  title: { absolute: "MatchMySkillset: match your CV to live UK jobs" },
  description:
    "Upload your CV and see live UK jobs scored against your skills, from maintenance and CNC to robotics, automation and 3D printing. Works for any job. Free.",
  alternates: { canonical: "/" },
};

const HERO_STEPS = [
  { title: "Add your CV", text: "Upload a PDF or Word file, or paste the text, and say where you want to work." },
  {
    title: "We read your skills",
    text: "We pick out what you can do, from fault finding to PLC programming, and search live adverts from Reed, Adzuna and more.",
  },
  { title: "Apply to your best matches", text: "See the skills you share with each job and the ones to work on, then apply." },
];

const SOURCES = ["Reed", "Adzuna", "GOV.UK Teaching Vacancies", "Himalayas", "Remotive"];

const FAQS: FaqItem[] = [
  {
    q: "Is it only for engineering and manufacturing jobs?",
    a: "No. Our guides and examples focus on engineering, manufacturing and Industry 4.0, such as maintenance, CNC, robotics, automation and 3D printing, but the CV match works for any job: we pick out your skills and score live UK adverts in any field against them.",
  },
  {
    q: "Is MatchMySkillset free?",
    a: `Yes. Matching your CV to live jobs, and seeing the careers that fit you, is free and needs no account. The only paid extra is the optional Career Change Report: ${REPORT_PRICE_LABEL}, paid once, for a full plan for one career.`,
  },
  {
    q: "Where do the jobs come from?",
    a: "Live adverts from UK job boards, including Reed, Adzuna and GOV.UK Teaching Vacancies, remote roles open to UK applicants from Himalayas and Remotive, and jobs that employers post on MatchMySkillset. For adverts from other boards, you apply on the original site.",
  },
  {
    q: "How is my match worked out?",
    a: "We pick out the skills in your CV, then find the skills each advert asks for. Your match reflects how many of those you already show. Every job lists the skills you share and the ones you do not show yet, so you can check it for yourself.",
  },
  {
    q: "What happens to my CV?",
    a: "Your CV text is sent to Anthropic's Claude model to pick out your skills. We keep your results for 12 months so your private link keeps working. An employer only sees your CV if you apply to one of their jobs on MatchMySkillset, or you accept their request to contact you. The privacy policy has the full detail.",
  },
  {
    q: "Can employers find me?",
    a: "Only if you choose to. If you switch on \"Let employers find me\", employers see an anonymous profile: your headline, current role, region, years of experience and skills, with no name or contact details. If one asks to contact you, you decide by email whether to share your details.",
  },
  {
    q: "Who runs MatchMySkillset?",
    a: "MatchMySkillset is a joint venture with Flintstone Associates, a specialist recruitment firm. Its recruiters prepare the shortlists employers can ask for on our Growth and Enterprise plans. The about page has more.",
  },
  {
    q: "I am hiring. How do I post a job?",
    a: "Employer plans start at £199 a month. You post your roles, we match them against candidates' skills, and applicants arrive in one inbox. The employer page has the plans and how it works.",
  },
];

// Real ONS figures, read from the careers dataset at build time.
const PAY_IDS = ["robotics-engineer", "automation-engineer", "field-service-engineer", "automation-technician", "cnc-machinist"];

function payRows() {
  return PAY_IDS.map((id) => occupationPayById(id))
    .filter((p): p is typeof p & { median: number } => typeof p.median === "number")
    .sort((a, b) => b.median - a.median);
}

export default function Home() {
  const pay = payRows();
  const top = pay[0]?.median ?? 1;
  const others = OTHER_CAREER_HUBS.filter((h) => h.href !== "/careers-for");

  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* Hero: the promise on the left, the CV card on the right */}
      <div className="relative overflow-hidden">
        <HeroGlow top="-8%" opacity={0.18} />
        <section className="relative px-4 sm:px-6 pb-16 pt-12 md:pb-20 md:pt-20" aria-labelledby="hero-title">
          <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[1fr_500px] lg:gap-x-14 lg:gap-y-10">
            <div className="lg:pt-8">
              <p className="eyebrow rise text-link">Engineering, manufacturing and Industry 4.0 jobs</p>
              <h1 id="hero-title" className="display mt-2">
                Your CV.
                <br />
                <span className="gradient-text">
                  Matched to
                  <br />
                  real jobs.
                </span>
              </h1>
              <p className="lede mt-6 max-w-[520px]">
                Upload your CV and see the live UK jobs you could apply for today, from maintenance and CNC to robotics, automation and 3D
                printing, each scored against the skills you already have. It works for any other job too.
              </p>
            </div>
            <div className="rise rise-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <CvUploadCard variant="hero" />
            </div>
            <div className="rise rise-3 lg:col-start-1">
              <StepList steps={HERO_STEPS} />
              <p className="mt-8 text-[15px] text-mute">
                Hiring?{" "}
                <Link href="/employers" className="text-link hover:underline">
                  Post a job and get matched candidates
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Where the jobs come from: real sources, named in plain text */}
      <section aria-labelledby="sources-title" className="px-4 sm:px-6 pb-16 md:pb-20">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 border-t hairline pt-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <h2 id="sources-title" className="flex items-center gap-2.5 text-[14px] font-medium tracking-normal text-mute">
            <span className="live-dot" aria-hidden="true" />
            Live UK adverts from
          </h2>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[15px] font-semibold tracking-[-0.02em] text-ink/70 sm:gap-x-7 sm:text-[17px]">
            {SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
            <li className="basis-full text-ink sm:basis-auto">and employers who post here</li>
          </ul>
        </div>
      </section>

      {/* How matching works */}
      <section className="bg-cloud px-4 sm:px-6 py-20 md:py-28" aria-labelledby="how-title">
        <div className="mx-auto max-w-[1080px]">
          <SectionHeading
            id="how-title"
            align="center"
            title={
              <>
                Your skills in.
                <br />
                Live jobs out.
              </>
            }
            lede="You add your CV. We do the searching and the scoring."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <StepTile n={1} title="Add your CV." text="Upload a file or paste the text. We pick out the skills you have shown, from fault finding to PLC programming.">
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-cloud text-[10px] font-bold text-mute">CV</span>
                  <div className="text-[13px] font-semibold text-ink">your-cv.pdf</div>
                </div>
                <div className="mt-3 h-2 w-4/5 rounded-full bg-cloud" />
                <div className="mt-1.5 h-2 w-3/5 rounded-full bg-cloud" />
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">Skills found</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Fault finding", "PLC programming", "Preventive maintenance", "Team leadership"].map((s) => (
                    <span key={s} className="rounded-full bg-sky px-2 py-0.5 text-[11px] font-medium text-link">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </StepTile>
            <StepTile n={2} title="We search live jobs." text="We look for adverts open now on UK job boards, near where you want to work or remote.">
              <div className="space-y-2">
                {["Reed", "Adzuna", "Jobs posted on MatchMySkillset"].map((s) => (
                  <div key={s} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <span className="live-dot" />
                    <div className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{s}</div>
                    <span className="text-[11px] font-medium text-mute">Searching</span>
                  </div>
                ))}
              </div>
            </StepTile>
            <StepTile n={3} title="Every job gets a score." text="We check each advert's skills against yours, so you can see what matches and what is missing.">
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-ink">Automation Technician</div>
                  <span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green">4 of 5 skills</span>
                </div>
                <div className="mt-1 text-[11px] text-mute">Example listing</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-cloud">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#12b5a4] to-[#0a7cff]" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Fault finding", "PLC programming"].map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-medium text-green">
                      <Check className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-mute ring-1 ring-inset ring-black/[0.12]">To learn: SCADA</span>
                </div>
              </div>
            </StepTile>
          </div>
        </div>
      </section>

      {/* The results page */}
      <section className="px-4 sm:px-6 py-20 md:py-28" aria-labelledby="results-title">
        <div className="mx-auto grid max-w-[1080px] items-center gap-12 lg:grid-cols-[1fr_1.12fr] lg:gap-16">
          <div>
            <p className="eyebrow text-blue">Your results</p>
            <h2 id="results-title" className="headline mt-2">
              Jobs first. Ranked by how well you fit.
            </h2>
            <p className="mt-5 max-w-[520px] text-[19px] leading-snug text-mute">
              Your results lead with adverts you can apply for now. Each one shows the skills you share and the ones the advert asks for
              that your CV does not show yet.
            </p>
            <ul className="mt-8 space-y-3.5 text-[17px] text-ink">
              {[
                "Filter by location, salary, remote working and job type",
                "Stay in your field, or try something new",
                "Get an email when new jobs match your CV",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/discover" className="btn btn-primary btn-lg">
                Upload your CV
              </Link>
              <MoreLink href="/jobs">Browse all live jobs</MoreLink>
            </div>
          </div>
          <div className="relative">
            <HeroGlow top="10%" opacity={0.14} />
            <ResultsMockup className="relative" />
            <p className="relative mt-4 text-center text-[13px] text-mute">Illustration. Your results show real, live adverts.</p>
          </div>
        </div>
      </section>

      {/* Careers that fit, with real ONS pay */}
      <section className="bg-cloud px-4 sm:px-6 py-20 md:py-28" aria-labelledby="careers-title">
        <div className="mx-auto max-w-[1080px]">
          <SectionHeading
            id="careers-title"
            eyebrow="Careers that fit"
            eyebrowClassName="text-link"
            title="Where engineering and manufacturing skills lead."
            lede="Your CV also shows the careers your skills point to, with official ONS pay and the real ways in, such as apprenticeships and funded training: whether you are leaving the forces, have just graduated or are moving from the shop floor into automation."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
            <figure className="card-white flex flex-col p-6 sm:p-8">
              <figcaption>
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">UK median pay, full time</p>
                <p className="mt-1 text-[21px] font-bold tracking-[-0.025em] text-ink">Five engineering and manufacturing careers</p>
              </figcaption>
              <ul className="mt-6 flex-1 space-y-4">
                {pay.map((p) => (
                  <li key={p.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[15px] font-medium text-ink">{p.title}</span>
                      <span className="text-[15px] font-semibold tabular-nums text-ink">{formatGBP(p.median)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cloud" aria-hidden="true">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#12b5a4] via-[#0a7cff] to-[#7d4cdb]"
                        style={{ width: `${Math.round((p.median / top) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <AsheSourceNote className="mt-6" note="Median gross annual pay for full-time employee jobs in the UK. Each figure covers the whole ONS occupation group." />
            </figure>

            <div className="flex flex-col">
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2">
                {ENGINEERING_HUBS.map((h) => (
                  <li key={h.href}>
                    <Link
                      href={h.href}
                      className="group flex h-full min-h-[76px] items-center justify-between gap-2 rounded-[20px] bg-white px-4 py-4 transition-transform duration-300 hover:scale-[1.01] sm:px-5"
                    >
                      <span>
                        <span className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">Guide</span>
                        <span className="block text-[17px] font-semibold tracking-[-0.02em] text-ink">{h.short}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/careers-for"
                    className="group flex h-full min-h-[76px] items-center justify-between gap-2 rounded-[20px] bg-ink px-4 py-4 text-white transition-transform duration-300 hover:scale-[1.01] sm:px-5"
                  >
                    <span>
                      <span className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-white/70">Any other job</span>
                      <span className="block text-[17px] font-semibold tracking-[-0.02em]">All professions</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              </ul>
              <p className="mt-6 text-[15px] leading-relaxed text-mute">
                Each guide covers the jobs, what they pay and how to get in, with every figure linked to its source.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-mute">
                Other careers:{" "}
                {others.map((h, i) => (
                  <span key={h.href}>
                    {i > 0 && ", "}
                    <Link href={h.href} className="text-link hover:underline">
                      {h.label.charAt(0).toLowerCase() + h.label.slice(1)}
                    </Link>
                  </span>
                ))}
                .
              </p>
              <div className="mt-2">
                <MoreLink href="/careers-for">Browse careers by profession</MoreLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employers */}
      <section className="on-dark overflow-hidden bg-black px-4 sm:px-6 py-20 text-white md:py-28" aria-labelledby="employers-title">
        <div className="mx-auto grid max-w-[1080px] items-center gap-14 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="eyebrow bg-gradient-to-r from-[#2997ff] via-[#a78bfa] to-[#5ee0c8] bg-clip-text text-transparent">For employers</p>
            <h2 id="employers-title" className="display mt-3">
              Hiring? Meet people who fit the job.
            </h2>
            <p className="mt-6 max-w-[520px] text-[19px] leading-snug text-[#a1a1a6]">
              Post an engineering, manufacturing or technical role, or any other job, and we match it against the skills of people looking
              for work. Applicants arrive in one inbox, and you can ask matched candidates to get in touch.
            </p>
            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <Link href="/employers" className="btn btn-primary btn-lg">
                Post a job
              </Link>
              <MoreLink href="/employers/pricing" light>
                See employer pricing
              </MoreLink>
            </div>
            <ul className="mt-12 grid gap-4 text-[15px] text-[#d2d2d7] sm:grid-cols-3">
              {["Plans from £199 a month", "A skills match on every applicant", "Candidates say yes before you see their details"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#30d158]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <EmployerMockup dark className="mx-auto w-full max-w-[460px]" />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cloud px-4 sm:px-6 py-20 md:py-28" aria-labelledby="faq-title">
        <div className="mx-auto max-w-[880px]">
          <h2 id="faq-title" className="headline">
            Questions? Answers.
          </h2>
          <div className="mt-10">
            <Faq items={FAQS} />
          </div>
          <p className="mt-8 text-[15px] text-mute">
            More detail in our{" "}
            <Link href="/privacy" className="text-link hover:underline">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link href="/about" className="text-link hover:underline">
              about page
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBand
        title="Your next job could be advertised today."
        text="Upload your CV and see which live jobs match your skills, in engineering and manufacturing or any other field. Free, with no account."
        primary={{ href: "/discover", label: "Upload your CV" }}
        secondary={{ href: "/jobs", label: "Browse live jobs" }}
      />
    </>
  );
}
