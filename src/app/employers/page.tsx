import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS } from "@/data/skills-taxonomy";
import { DashboardMockup } from "@/components/employer/DashboardMockup";
import { EnquiryForm } from "@/components/employer/EnquiryForm";
import { Faq, faqJsonLd } from "@/components/employer/Faq";
import { PricingCards } from "@/components/employer/PricingCards";
import { isStripeReady } from "@/lib/apis/stripe";
import { Building, Chart, ChevronRight, Inbox, Search, Shield, Target } from "@/components/employer/icons";
import { EMPLOYER_FAQS } from "@/lib/employer/faqs";
import { LISTING_DAYS } from "@/lib/employer/plans";
import { publicEmployerStats, SHOW_JOBS_FROM, SHOW_POOL_FROM } from "@/lib/employer/stats";

export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: "Post a job and hire on skills | MatchMySkillset" },
  description:
    "Post a UK job and we match it to job seekers whose CV skills fit. Applicants arrive in your dashboard and inbox. Plans from £49 a month.",
  alternates: { canonical: "/employers" },
};

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-more">
      {children}
      <ChevronRight />
    </Link>
  );
}

export default async function EmployersPage() {
  const paymentsOpen = await isStripeReady().catch(() => false);
  const stats = await publicEmployerStats();
  const showPool = stats.discoverable >= SHOW_POOL_FROM;
  const showJobs = stats.liveJobs >= SHOW_JOBS_FROM;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(EMPLOYER_FAQS)) }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20 md:pb-24">
        <div className="hero-glow top-[-10%] !opacity-[0.18]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[980px] text-center">
          <p className="rise inline-flex items-center gap-2.5 rounded-full bg-cloud px-4 py-2 text-[14px] font-medium text-ink">
            <Building className="h-4 w-4 text-mute" />
            MatchMySkillset for employers
          </p>
          <h1 className="display-hero rise rise-1 mt-7">
            Hire people whose skills <span className="gradient-text">fit.</span>
          </h1>
          <p className="lede rise rise-2 mx-auto mt-6 max-w-[680px]">
            Post a job and we match it to job seekers whose CVs show the skills you ask for. Applications arrive in your dashboard and your inbox, each with a
            match score.
          </p>
          <div className="rise rise-3 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/employers/sign-in" className="btn btn-primary btn-lg">
              Post a job
            </Link>
            <More href="#pricing">See pricing</More>
          </div>
          <p className="rise rise-3 mt-6 text-[14px] text-mute">Plans from £49 a month. A person checks every job before it goes live.</p>
        </div>
        <div className="rise rise-3 relative mt-14 md:mt-20">
          <DashboardMockup />
        </div>
      </section>

      {/* Live numbers, only once they are worth showing */}
      {(showPool || showJobs) && (
        <section className="px-5 pb-16" aria-label="MatchMySkillset today">
          <div className="mx-auto grid max-w-[980px] gap-4 sm:grid-cols-2">
            {showPool && (
              <div className="tile p-7 text-center">
                <p className="text-[44px] font-bold tracking-[-0.04em] text-ink">{stats.discoverable.toLocaleString("en-GB")}</p>
                <p className="mt-1 text-[15px] text-mute">job seekers have asked employers to find them</p>
              </div>
            )}
            {showJobs && (
              <div className="tile p-7 text-center">
                <p className="text-[44px] font-bold tracking-[-0.04em] text-ink">{stats.liveJobs.toLocaleString("en-GB")}</p>
                <p className="mt-1 text-[15px] text-mute">jobs posted on MatchMySkillset are live now</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-cloud px-5 py-20 md:py-28" aria-labelledby="how">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="eyebrow text-link">How it works</p>
            <h2 id="how" className="headline mt-2">
              From advert to applicants,
              <br className="hidden sm:block" /> matched on skills.
            </h2>
          </div>
          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Step n={1} title="Post your job." text="Sign in with your email, fill in one form and submit it. A person checks it before it goes live.">
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-[11px] font-semibold text-mute">Job title</div>
                <div className="mt-1 text-[13px] font-semibold text-ink">Office administrator</div>
                <div className="mt-3 h-2 w-4/5 rounded-full bg-cloud" />
                <div className="mt-1.5 h-2 w-3/5 rounded-full bg-cloud" />
                <div className="mt-4 inline-flex rounded-full bg-blue px-3 py-1 text-[11px] font-medium text-white">Submit for approval</div>
              </div>
            </Step>
            <Step n={2} title="We match it to CVs." text="We read the skills in your advert and show the job to people whose CV skills fit, with their match score.">
              <div className="space-y-2">
                {["Data entry", "Scheduling", "Written communication"].map((s, i) => (
                  <div key={s} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 text-[12px] font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    {s}
                    <span className={`h-2 w-2 rounded-full ${i < 2 ? "bg-[#30d158]" : "bg-line"}`} />
                  </div>
                ))}
              </div>
            </Step>
            <Step n={3} title="Applicants arrive." text="Each application lands in your dashboard and your inbox, with the CV and the skills they share with the role.">
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink">New applicant</span>
                  <span className="whitespace-nowrap rounded-full bg-[#e8f1fd] px-2 py-0.5 text-[10px] font-semibold text-[#0058b0]">74% match</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-cloud" />
                <div className="mt-1.5 h-2 w-2/3 rounded-full bg-cloud" />
              </div>
            </Step>
            <Step n={4} title="Search and reach out." text="Search people who chose to be found and ask to talk. If they accept, you get their name, email and CV.">
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-[12px] font-semibold text-ink">Anonymous profile</div>
                <div className="mt-1 text-[11px] text-mute">Retail supervisor · North West · 6 years</div>
                <div className="mt-3 inline-flex rounded-full border border-blue px-3 py-1 text-[11px] font-medium text-blue">Request contact</div>
              </div>
            </Step>
          </ol>
          <p className="mt-6 text-center text-[13px] text-mute">Examples above are illustrative.</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20 md:py-28" aria-labelledby="features">
        <div className="mx-auto max-w-[1080px]">
          <div className="max-w-[720px]">
            <h2 id="features" className="headline">
              Everything you need to hire.
            </h2>
            <p className="mt-5 text-[19px] leading-snug text-mute">
              Skills are read from your advert with the same list of {SKILLS.length} skills we use to read CVs, so both sides are measured the same way.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Target />} grad="from-[#0a84ff] to-[#5e5ce6]" title="A match score on every applicant" text="See at a glance which skills in your advert each applicant's CV shows, and which it does not." />
            <Feature icon={<Inbox />} grad="from-[#bf5af2] to-[#ff375f]" title="Applicants in one place" text="Every application in your dashboard and your inbox. Move people from shortlisted to interview, offer and hired, and download CVs." />
            <Feature icon={<Search />} grad="from-[#30d158] to-[#0a84ff]" title="People who asked to be found" text="Search job seekers who opted in, matched to your role. They decide whether to share their details with you. On Starter and above." />
            <Feature icon={<Chart />} grad="from-[#ff9f0a] to-[#ff375f]" title="Skills-gap report" text="For each role, how often its key skills appear among applicants and matched candidates. On Growth and above." />
            <Feature icon={<Building />} grad="from-[#64d2ff] to-[#0a84ff]" title="Your company page" text="A page for your company with your description, website and every live job. On Growth and above." />
            <Feature icon={<Shield />} grad="from-[#5e5ce6] to-[#bf5af2]" title="Checked by a person" text={`Every job is reviewed before it goes live and runs for ${LISTING_DAYS} days, renewable from your dashboard.`} />
          </div>
        </div>
      </section>

      {/* Candidate control */}
      <section className="overflow-hidden bg-black px-5 py-20 text-white md:py-28" aria-labelledby="control">
        <div className="mx-auto grid max-w-[1080px] items-center gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="eyebrow bg-gradient-to-r from-[#2997ff] via-[#a78bfa] to-[#ff6b9a] bg-clip-text text-transparent">Built on consent</p>
            <h2 id="control" className="display mt-3">
              Candidates stay
              <br />
              in control.
            </h2>
            <p className="mt-6 max-w-[520px] text-[19px] leading-snug text-[#a1a1a6]">
              Anyone who accepts your request has chosen to hear from you. Nobody is put in a database they did not ask to join.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Only people who tick “Let employers find me” appear in search.",
              "You see skills, current role, region and experience. No name, email or CV.",
              "They accept or decline your request. Only then do you get their details.",
              "Applicants share their CV with you for that role only.",
            ].map((t) => (
              <li key={t} className="flex gap-3 rounded-[22px] bg-white/[0.08] p-5 text-[16px] leading-snug text-[#e8e8ed]">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#30d158]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 px-5 py-20 md:py-28" aria-labelledby="pricing-title">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 id="pricing-title" className="headline">
            Simple monthly plans.
          </h2>
          <p className="lede mx-auto mt-5 max-w-[620px]">Pick the number of live jobs you need. No set-up fee, no minimum term.</p>
        </div>
        <div className="mt-12">
          <PricingCards mode="public" paymentsOpen={paymentsOpen} />
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="scroll-mt-20 bg-cloud px-5 py-20 md:py-28" aria-labelledby="enquiry-title">
        <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <p className="eyebrow text-link">Enterprise, pay per hire and partner rates</p>
            <h2 id="enquiry-title" className="headline mt-2">
              Talk to us.
            </h2>
            <p className="mt-5 max-w-[440px] text-[19px] leading-snug text-mute">
              Hiring at volume, or only now and then? Tell us what you need and we will reply by email with a price.
            </p>
          </div>
          <EnquiryForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20 md:py-28" aria-labelledby="faq">
        <div className="mx-auto max-w-[880px]">
          <h2 id="faq" className="headline">
            Questions? Answers.
          </h2>
          <div className="mt-10">
            <Faq items={EMPLOYER_FAQS} />
          </div>
        </div>
      </section>

      {/* Final call */}
      <section className="relative overflow-hidden px-5 pb-28 pt-8 text-center md:pb-36">
        <div className="hero-glow top-[10%] !opacity-[0.16]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[760px]">
          <h2 className="display">Ready to hire on skills?</h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/employers/sign-in" className="btn btn-primary btn-lg">
              Post a job
            </Link>
            <More href="/employers/pricing">Compare plans</More>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, text, children }: { n: number; title: string; text: string; children: React.ReactNode }) {
  return (
    <li className="card-white flex flex-col overflow-hidden p-7">
      <p className="text-[15px] font-semibold text-mute">Step {n}</p>
      <h3 className="title mt-1">{title}</h3>
      <p className="mt-3 text-[16px] leading-snug text-mute">{text}</p>
      <div className="mt-8 flex-1 rounded-[22px] bg-gradient-to-b from-[#ececf0] to-[#e4e4ea] p-4" aria-hidden="true">
        {children}
      </div>
    </li>
  );
}

function Feature({ icon, title, text, grad }: { icon: React.ReactNode; title: string; text: string; grad: string }) {
  return (
    <div className="tile p-7">
      <div className={`grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br ${grad} text-white`}>{icon}</div>
      <h3 className="mt-6 text-[21px] font-bold tracking-[-0.03em] text-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-mute">{text}</p>
    </div>
  );
}
