import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { candidateTablesReady, getCandidate } from "@/lib/candidate/session";
import { entitlementFor, isPlusAccount } from "@/lib/candidate/entitlements";
import { listAccountPacks, type PackSummary } from "@/lib/candidate/packs";
import { linkedResults, profileForAccount, type LinkedProfile, type LinkedResults } from "@/lib/candidate/account";
import { NOT_SWITCHED_ON, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL } from "@/lib/candidate/plans";
import { deleteCandidateAccount, deleteCandidateSavedCv, signOutCandidate, updateCandidateSettings } from "./actions";
import { BillingButton, LinkBrowserResults } from "./AccountClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

function day(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
}

const NOTICES: Record<string, { text: string; tone: "ok" | "error" }> = {
  "plus=started": { text: "Thanks: Plus is starting. It switches on as soon as Stripe confirms the payment, usually within a minute.", tone: "ok" },
  "welcome=1": { text: "You are signed in.", tone: "ok" },
  "saved=settings": { text: "Settings saved.", tone: "ok" },
  "saved=cv": { text: "Your saved CV has been deleted.", tone: "ok" },
  "saved=error": { text: "We could not save that just now. Please try again.", tone: "error" },
  "deleted=pack": { text: "The job pack has been deleted.", tone: "ok" },
  "delete=confirm": { text: "Tick the box to confirm you want to delete your account.", tone: "error" },
  "delete=busy": { text: "Too many attempts. Please try again later.", tone: "error" },
  "delete=plus": { text: "We could not cancel your Plus plan with Stripe, so nothing has been deleted yet. We have been told and will sort it out; you can also cancel from Manage billing and try again.", tone: "error" },
  "delete=error": { text: "Something went wrong deleting your account. Nothing has been lost; please try again or email hello@matchmyskillset.com.", tone: "error" },
};

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="card-white scroll-mt-24 p-5 sm:p-7">
      <h2 id={`${id}-title`} className="text-[21px] font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PackList({ packs }: { packs: PackSummary[] }) {
  if (packs.length === 0) {
    return (
      <div>
        <p className="text-[15px] text-mute">No job packs yet. Pick a job on your results page and press &ldquo;Tailor my CV for this job&rdquo;, or paste any advert.</p>
        <Link href="/tools/tailor" className="btn btn-primary btn-sm mt-4">
          Tailor my CV
        </Link>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-hair">
      {packs.map((p) => (
        <li key={p.token} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <Link href={`/packs/${p.token}`} className="text-[16px] font-semibold text-ink hover:text-blue">
              {p.title}
            </Link>
            <p className="text-[14px] text-mute">
              {[p.company, day(p.createdAt), p.scope === "cv" ? "Tailored CV" : "Full pack"].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className={`pill !px-2.5 !py-0.5 text-[12px] ${p.approved ? "bg-green-soft text-green" : p.status === "failed" ? "bg-[#fdecea] text-[#8c1d18]" : "bg-cloud text-ink-2"}`}>
            {p.approved ? "Approved" : p.status === "ready" ? "Ready to check" : p.status === "failed" ? "Needs attention" : "Being written"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const account = await getCandidate();
  if (!account) {
    if (!(await candidateTablesReady())) {
      return (
        <div className="mx-auto max-w-[640px] px-4 py-24 text-center sm:px-6">
          <h1 className="headline">Not switched on yet.</h1>
          <p className="lede mt-4">{NOT_SWITCHED_ON}</p>
        </div>
      );
    }
    redirect("/account/sign-in?next=/account");
  }

  const [ent, packs, results, profile] = await Promise.all([
    entitlementFor(account),
    listAccountPacks(account.id).catch(() => [] as PackSummary[]),
    linkedResults(account.id).catch(() => [] as LinkedResults[]),
    profileForAccount(account).catch(() => null as LinkedProfile | null),
  ]);
  const plus = isPlusAccount(account);
  const noticeKey = Object.keys(NOTICES).find((k) => {
    const [name, value] = k.split("=");
    return sp[name] === value;
  });
  const notice = noticeKey ? NOTICES[noticeKey] : null;

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-40%] !opacity-[0.10]" aria-hidden="true" />
      <LinkBrowserResults known={results.map((r) => r.token)} />
      <div className="relative mx-auto max-w-[1080px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-blue">Your account</p>
            <h1 className="headline mt-2">Hello again.</h1>
            <p className="mt-2 text-[17px] text-mute">Signed in as {account.email}</p>
          </div>
          <form action={signOutCandidate}>
            <button type="submit" className="btn btn-secondary btn-sm">
              Sign out
            </button>
          </form>
        </header>

        {notice && (
          <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-6 rounded-2xl px-4 py-3 text-[15px] ${notice.tone === "error" ? "bg-[#fdecea] text-[#8c1d18]" : "bg-green-soft text-ink"}`}>
            {notice.text}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
            <Card id="packs" title="Your job packs">
              <PackList packs={packs} />
            </Card>

            <Card id="results" title="Your results pages">
              {results.length ? (
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li key={r.token}>
                      <Link href={`/results/${r.token}`} className="text-[15px] font-medium text-link hover:underline">
                        {r.role ? `Results for ${r.role}` : "Your results"}
                      </Link>{" "}
                      <span className="text-[14px] text-mute">from {day(r.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-mute">
                  None linked yet. When you open your results in this browser while signed in, they are added here.{" "}
                  <Link href="/discover" className="text-link hover:underline">
                    Match your CV
                  </Link>
                </p>
              )}
              {profile && (
                <p className="mt-4 rounded-2xl bg-cloud px-4 py-3 text-[14px] text-ink-2">
                  You also have a profile employers can {profile.discoverable ? "find" : "find once you confirm it"}.{" "}
                  <Link href={`/me/${profile.manageToken}`} className="text-link hover:underline">
                    Manage your employer profile
                  </Link>
                </p>
              )}
            </Card>

            <Card id="cv" title="Your saved CV">
              {account.saved_cv_at ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[15px] text-ink-2">
                    {account.saved_cv_name || "Your CV"}, saved {day(account.saved_cv_at)}. We use it only when you write a job pack.
                  </p>
                  <form action={deleteCandidateSavedCv}>
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Delete saved CV
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-[15px] text-mute">No CV saved. When you write a pack you can tick &ldquo;Keep this CV on my account&rdquo; so you do not have to upload it again.</p>
              )}
            </Card>

            <Card id="settings" title="Emails and tracking">
              <form action={updateCandidateSettings} className="space-y-4">
                <label className="flex items-start gap-3 text-[15px] text-ink-2">
                  <input type="checkbox" name="tracking" defaultChecked={Boolean(account.tracking_consent_at)} className="mt-1 h-4 w-4 shrink-0 accent-[#0071e3]" />
                  <span>
                    <strong className="text-ink">Track my applications.</strong> Keep a record of the jobs I apply for and ask me afterwards whether I heard back.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-[15px] text-ink-2">
                  <input type="checkbox" name="marketing" defaultChecked={Boolean(account.marketing_consent_at)} className="mt-1 h-4 w-4 shrink-0 accent-[#0071e3]" />
                  <span>
                    <strong className="text-ink">News from MatchMySkillset.</strong> Occasional emails about new tools and offers. You can untick this at any time.
                  </span>
                </label>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Save settings
                </button>
              </form>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card id="plan" title="Your plan">
              {plus ? (
                <div className="space-y-3 text-[15px] text-ink-2">
                  <p>
                    <strong className="text-ink">Plus, {PLUS_PRICE_LABEL} a month.</strong>{" "}
                    {account.plan_status === "past_due"
                      ? "Your last payment did not go through: Stripe will try again. Update your card in Manage billing."
                      : account.cancel_at_period_end
                        ? `Cancelled: Plus runs until ${day(account.current_period_end)}.`
                        : account.current_period_end
                          ? `Renews on ${day(account.current_period_end)}.`
                          : ""}
                  </p>
                  {ent.plusUsage && (
                    <div>
                      <p>
                        {ent.plusUsage.used} of {PLUS_PACKS_PER_MONTH} job packs used this billing month.
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cloud" aria-hidden="true">
                        <div className="h-full rounded-full bg-blue" style={{ width: `${Math.min(100, (ent.plusUsage.used / PLUS_PACKS_PER_MONTH) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href="/tools/check" className="btn btn-primary btn-sm">
                      Check any job
                    </Link>
                    {account.stripe_customer_id && <BillingButton />}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-[15px] text-ink-2">
                  <p>
                    <strong className="text-ink">Free.</strong> Live jobs scored against your CV, job alerts, applying and careers are free for good.
                  </p>
                  <p>
                    Free tailored CV: {account.free_pack_used_at ? `used on ${day(account.free_pack_used_at)}.` : "not used yet."}
                  </p>
                  <Link href="/plus" className="btn btn-primary btn-sm">
                    See Plus
                  </Link>
                  {account.stripe_customer_id && (
                    <div className="pt-1">
                      <BillingButton label="Past invoices" />
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card id="data" title="Your data">
              <p className="text-[15px] text-ink-2">Everything we hold for your account, as a file you can keep.</p>
              <a href="/api/account/export" className="btn btn-secondary btn-sm mt-4">
                Download my data
              </a>
            </Card>

            <Card id="delete" title="Delete your account">
              <form action={deleteCandidateAccount} className="space-y-3 text-[14px] text-ink-2">
                <p>This deletes your account, your job packs (with the CV text inside them) and your saved CV straight away.{plus ? " Your Plus plan is cancelled first." : ""}</p>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="results" defaultChecked className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]" />
                  <span>Also delete the results pages linked to this account</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="confirm" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]" />
                  <span>Yes, delete my account</span>
                </label>
                <button type="submit" className="btn btn-sm border border-[#b3261e] bg-white text-[#b3261e] hover:bg-[#fdecea]">
                  Delete my account
                </button>
                <p className="text-[13px] text-mute">
                  Your employer profile and job alerts have their own delete links. We keep a record of any payment for 6 years for tax.
                </p>
              </form>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
