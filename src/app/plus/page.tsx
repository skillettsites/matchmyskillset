import type { Metadata } from "next";
import Link from "next/link";
import { Faq, type FaqItem } from "@/components/marketing";
import { Check, Minus } from "@/components/employer/icons";
import { isStripeReady } from "@/lib/apis/stripe";
import { getCandidate } from "@/lib/candidate/session";
import { isPlusAccount } from "@/lib/candidate/entitlements";
import { PACK_PRICE_LABEL, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL } from "@/lib/candidate/plans";
import { CONTACT_EMAIL } from "@/lib/site";
import { PlusButton } from "./PlusButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plus and job packs: CV tools pricing",
  description: `Matching your CV to live jobs is free. A job pack (a CV tailored to one job, a cover letter and interview prep) is ${PACK_PRICE_LABEL}. Plus is ${PLUS_PRICE_LABEL} a month for up to ${PLUS_PACKS_PER_MONTH} packs.`,
  alternates: { canonical: "/plus" },
};

const FAQ: FaqItem[] = [
  {
    q: "Will it make things up to fit the job?",
    a: "No. The CV is rewritten only from what your own CV says: we reorder it, reword it and lead with what the employer asks for. After the AI model has written it, our own checks take out any employer, date, qualification, skill or figure that is not in your CV, and show you what they took out. Anything the advert asks for that your CV does not show is listed as a gap, not added. You read and edit everything before you download it.",
  },
  {
    q: "What does the fair use limit mean?",
    a: `Plus includes up to ${PLUS_PACKS_PER_MONTH} job packs in each billing month. The count starts again when your plan renews. Check any job has no monthly limit, only a daily limit to stop misuse.`,
  },
  {
    q: "Can I cancel Plus?",
    a: "Yes, at any time, from Manage billing in your account. Plus then runs to the end of the month you have paid for and does not renew. If you cancel within 14 days of starting and have not had a job pack yet, email us for a full refund.",
  },
  {
    q: "Do I need an account?",
    a: `Not for a ${PACK_PRICE_LABEL} job pack: you get a private link to it by email. The free tailored CV and Plus need a free account, so we know each person gets one free try. Signing in is by a link sent to your email; there is no password.`,
  },
  {
    q: "What happens to my CV?",
    a: "We send it to Anthropic, the company behind the Claude AI model, to write your pack, and keep it inside the pack so we can finish or redo it. It is deleted with the pack: when you delete it, when you delete your account, or after 12 months for a pack bought without an account. We only keep a separate copy on your account if you tick the box asking us to.",
  },
  {
    q: "Is the free part really free?",
    a: "Yes. Uploading your CV, seeing live jobs scored against it, job alerts, applying for jobs posted here and the careers that fit you are free, with no account needed. Only the CV tools on this page cost money, apart from your one free tailored CV.",
  },
];

type Cell = string | boolean;
const ROWS: { label: string; free: Cell; pack: Cell; plus: Cell }[] = [
  { label: "Live jobs scored against your CV", free: true, pack: true, plus: true },
  { label: "Job alerts by email", free: true, pack: true, plus: true },
  { label: "Apply for jobs posted on MatchMySkillset", free: true, pack: true, plus: true },
  { label: "Careers that fit you, with ONS pay", free: true, pack: true, plus: true },
  { label: "Your CV tailored to one job", free: "One, to try", pack: "For that job", plus: `Up to ${PLUS_PACKS_PER_MONTH} a month` },
  { label: "Cover letter for the job", free: false, pack: true, plus: true },
  { label: "Interview prep for the job", free: false, pack: true, plus: true },
  { label: "Word and PDF downloads", free: true, pack: true, plus: true },
  { label: "Check any job: paste an advert, see your match and gaps", free: false, pack: false, plus: true },
];

function CellView({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-green" />;
  if (value === false) return <Minus className="mx-auto h-5 w-5 text-mute-2" />;
  return <span className="text-[14px] font-medium text-ink">{value}</span>;
}

export default async function PlusPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [account, paymentsOpen] = await Promise.all([getCandidate(), isStripeReady().catch(() => false)]);
  const hasPlus = isPlusAccount(account);

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 md:pt-20">
        <div className="hero-glow top-[-20%] !opacity-[0.16]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[900px] text-center">
          <p className="eyebrow rise text-blue">CV tools</p>
          <h1 className="display rise rise-1 mt-3">
            A CV written for <span className="gradient-text">each job.</span>
          </h1>
          <p className="lede rise rise-2 mx-auto mt-5 max-w-[640px]">
            Finding jobs that match your CV is free. When you find one worth applying for, a job pack rewrites your own CV for it, with a cover letter and interview prep.
          </p>
          {sp.checkout === "cancelled" && (
            <p role="status" className="mx-auto mt-6 max-w-[560px] rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
              Payment cancelled. You have not been charged.
            </p>
          )}
        </div>
      </section>

      <section aria-label="Plans" className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-[1080px] gap-4 md:grid-cols-3">
          <div className="flex flex-col rounded-[28px] bg-cloud p-7">
            <h2 className="text-[24px] font-bold tracking-[-0.03em] text-ink">Free</h2>
            <p className="mt-1 min-h-[44px] text-[15px] leading-snug text-mute">Everything you need to find jobs that fit you.</p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[48px] font-bold tracking-[-0.04em]">£0</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[15px] leading-snug">
              {["Live jobs scored against your CV", "Job alerts by email", "Apply for jobs posted here", "Careers that fit you", "One tailored CV to try (free account)"].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/discover" className="btn btn-dark mt-8 w-full">
              Upload your CV
            </Link>
          </div>

          <div className="flex flex-col rounded-[28px] bg-cloud p-7">
            <h2 className="text-[24px] font-bold tracking-[-0.03em] text-ink">Job pack</h2>
            <p className="mt-1 min-h-[44px] text-[15px] leading-snug text-mute">For one job you really want. No account needed.</p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[48px] font-bold tracking-[-0.04em]">{PACK_PRICE_LABEL}</span>
              <span className="text-[15px] text-mute">per job</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[15px] leading-snug">
              {[
                "Your CV rewritten for the job",
                "A cover letter for the job",
                "Interview prep: 8 to 10 likely questions, answers drawn from your CV, and 3 to ask them",
                "The gaps: what the advert asks for that your CV does not show",
                "Edit everything, then download Word or PDF",
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  {f}
                </li>
              ))}
            </ul>
            {paymentsOpen ? (
              <Link href="/tools/tailor" className="btn btn-dark mt-8 w-full">
                Tailor my CV
              </Link>
            ) : (
              <div className="mt-8">
                <p className="mb-3 rounded-2xl bg-white px-4 py-3 text-center text-[14px] leading-snug text-ink-2">Card payments open shortly. Your free tailored CV works now.</p>
                <Link href="/tools/tailor" className="btn btn-dark w-full">
                  Try it free
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-[28px] bg-ink p-7 text-white">
            <h2 className="text-[24px] font-bold tracking-[-0.03em]">Plus</h2>
            <p className="mt-1 min-h-[44px] text-[15px] leading-snug text-white/70">For when you are applying for lots of jobs.</p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[48px] font-bold tracking-[-0.04em]">{PLUS_PRICE_LABEL}</span>
              <span className="text-[15px] text-white/70">a month</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[15px] leading-snug">
              {[
                `Up to ${PLUS_PACKS_PER_MONTH} job packs a month (fair use)`,
                "Check any job: paste any advert and see your match and gaps",
                "Full access to the application tracker",
                "Cancel any time",
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#30d158]" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <PlusButton signedIn={Boolean(account)} hasPlus={hasPlus} paymentsOpen={paymentsOpen} dark />
            </div>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-[760px] text-center text-[13px] leading-relaxed text-mute">
          Card payments are taken by Stripe. Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="compare-title" className="bg-cloud px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1000px]">
          <h2 id="compare-title" className="headline text-center">
            What you get.
          </h2>
          <div className="mt-10 overflow-x-auto rounded-[22px] bg-white">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-hair">
                  <th scope="col" className="px-5 py-4 font-semibold text-ink">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-ink">
                    Free
                  </th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-ink">
                    Job pack {PACK_PRICE_LABEL}
                  </th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-ink">
                    Plus {PLUS_PRICE_LABEL} a month
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-b border-hair last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-normal text-ink-2">
                      {r.label}
                    </th>
                    <td className="px-4 py-3.5 text-center">
                      <CellView value={r.free} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellView value={r.pack} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellView value={r.plus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1000px]">
          <h2 id="how-title" className="headline">
            How a job pack is written.
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Pick the job", "From your matched jobs, a job posted here, or any advert you paste. We read the whole advert where the job board gives it to us."],
              [
                "We tailor your CV",
                "An AI model (Claude, by Anthropic) rewrites your own CV for that advert. Our checks then take out anything that is not in your CV and list what the advert wants that your CV does not show.",
              ],
              ["You check and download", "Read every section, change anything you like, approve it, then download Word or PDF."],
            ].map(([t, d], i) => (
              <li key={t} className="tile p-6">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-ink">{t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-[880px]">
          <h2 id="faq-title" className="headline">
            Questions.
          </h2>
          <div className="mt-8">
            <Faq items={FAQ} schema />
          </div>
          <p className="mt-8 text-[14px] text-mute">
            Full details in our{" "}
            <Link href="/terms#cv-tools" className="text-link hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy#cv-tools" className="text-link hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
