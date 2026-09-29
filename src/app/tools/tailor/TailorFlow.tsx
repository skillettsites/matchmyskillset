"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { CvPicker, NO_CV, type CvChoice } from "@/components/candidate/CvPicker";
import { CandidateSignInForm } from "@/components/candidate/SignInForm";
import { takeTailorDraft } from "@/components/candidate/draft";
import { MIN_ADVERT_CHARS, MIN_CV_CHARS, NOT_SWITCHED_ON, PACK_CONSENT_TEXT, PACK_PRICE_LABEL, PACK_PRICE_VALUE, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL } from "@/lib/candidate/plans";
import type { PackFit, PackJob } from "@/lib/candidate/pack-types";

interface AccountState {
  signedIn: boolean;
  email: string | null;
  plus: boolean;
  plusLeft: number | null;
  freeAvailable: boolean;
  saved: { name: string | null; at: string } | null;
}

type Pay = "plus" | "free" | "card";

function Check({ off = false }: { off?: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-mute-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M6 12h12" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card-white p-5 sm:p-7" aria-labelledby={`step-${n}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white" aria-hidden="true">
          {n}
        </span>
        <h2 id={`step-${n}`} className="text-[21px] font-semibold tracking-[-0.02em] text-ink">
          {title}
        </h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TailorFlow(props: {
  ready: boolean;
  source: "results" | "mms" | "pasted";
  from: string | null;
  jobId: string | null;
  mmsId: string | null;
  job: PackJob | null;
  fit: PackFit | null;
  here: string;
  paymentsOpen: boolean;
  initial: AccountState;
}) {
  const { ready, source, from, jobId, mmsId, job, fit, here, paymentsOpen } = props;
  const [acct, setAcct] = useState<AccountState>(props.initial);
  const [cv, setCv] = useState<CvChoice>(NO_CV);
  const [saveCv, setSaveCv] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  // Not filled with the board's summary: the pack should be written from the whole advert.
  const [advert, setAdvert] = useState("");
  const [pay, setPay] = useState<Pay | null>(null);
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const needAdvert = !job || !job.fullText;
  const plusOk = acct.plus && (acct.plusLeft === null || acct.plusLeft > 0);
  const options = useMemo(() => {
    const o: Pay[] = [];
    if (plusOk) o.push("plus");
    if (!acct.signedIn || acct.freeAvailable) o.push("free");
    if (paymentsOpen) o.push("card");
    return o;
  }, [plusOk, acct.signedIn, acct.freeAvailable, paymentsOpen]);
  // Plus first when they have it, then the free try, then card.
  const chosen: Pay | null = pay && options.includes(pay) ? pay : (options[0] ?? null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/status", { cache: "no-store" });
      const d = (await res.json()) as Partial<AccountState> & { signedIn?: boolean; savedCv?: boolean };
      if (d.signedIn) {
        setAcct((a) => ({
          signedIn: true,
          email: d.email ?? a.email,
          plus: Boolean(d.plus),
          plusLeft: d.plusLeft ?? null,
          freeAvailable: Boolean(d.freeAvailable),
          saved: d.savedCv ? (a.saved ?? { name: null, at: new Date().toISOString() }) : null,
        }));
        setWaiting(false);
        if (poll.current) clearInterval(poll.current);
        poll.current = null;
      }
    } catch {
      // try again on the next tick
    }
  }, []);

  const onSent = useCallback(() => {
    setWaiting(true);
    if (poll.current) clearInterval(poll.current);
    poll.current = setInterval(() => void refresh(), 3000);
  }, [refresh]);

  // An advert handed over from "Check any job" in this tab.
  useEffect(() => {
    if (job) return;
    let live = true;
    // Read after the first paint, so the server and client render the same empty form first.
    void Promise.resolve().then(() => {
      const d = live ? takeTailorDraft() : null;
      if (d) {
        setTitle(d.title);
        setCompany(d.company);
        setAdvert(d.advert);
      }
    });
    return () => {
      live = false;
    };
  }, [job]);

  useEffect(() => {
    const onFocus = () => {
      if (waiting) void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (poll.current) clearInterval(poll.current);
    };
  }, [waiting, refresh]);

  async function start() {
    setError("");
    if (!ready) {
      setError(NOT_SWITCHED_ON);
      return;
    }
    if (!job && title.trim().length < 2) {
      setError("Add the job title.");
      return;
    }
    if (needAdvert && advert.trim().length < MIN_ADVERT_CHARS) {
      setError(`Paste the whole job advert (at least ${MIN_ADVERT_CHARS} characters).`);
      return;
    }
    if (cv.kind !== "saved" && cv.text.trim().length < MIN_CV_CHARS) {
      setError("Upload or paste your whole CV first.");
      return;
    }
    if (!chosen) return;
    if (chosen === "card" && !consent) {
      setError("Please tick the box to agree to getting your pack straight away.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          from,
          jobId,
          mmsId,
          job: source === "pasted" ? { title, company } : undefined,
          advertText: needAdvert ? advert : undefined,
          cvText: cv.kind === "saved" ? "" : cv.text,
          useSavedCv: cv.kind === "saved",
          cvName: cv.name,
          saveCv: acct.signedIn && cv.kind !== "saved" && saveCv,
          pay: chosen,
          consent: chosen === "card" ? consent : undefined,
          email: chosen === "card" && !acct.signedIn ? email : undefined,
          back: here,
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { url?: string; checkoutUrl?: string; error?: string; signIn?: boolean };
      if (res.ok && d.checkoutUrl) {
        track("begin_checkout", { currency: "GBP", value: PACK_PRICE_VALUE, items: [{ item_id: "job_pack", item_name: "Job pack", price: PACK_PRICE_VALUE, quantity: 1 }] });
        window.location.href = d.checkoutUrl;
        return;
      }
      if (res.ok && d.url) {
        track("tool_used", { tool: "tailor_cv", pay: chosen });
        window.location.href = d.url;
        return;
      }
      if (d.signIn) setAcct((a) => ({ ...a, signedIn: false }));
      setError(d.error || "We could not start your pack. Please try again.");
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    }
    setBusy(false);
  }

  const label = chosen === "card" ? `Pay ${PACK_PRICE_LABEL} and write my pack` : chosen === "free" ? "Write my free tailored CV" : "Write my job pack";

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-6">
        {!ready && (
          <p role="status" className="rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink">
            {NOT_SWITCHED_ON}
          </p>
        )}

        <Step n={1} title="The job">
          {job ? (
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className={`pill !px-2.5 !py-0.5 text-[12px] ${job.source === "mms" ? "bg-blue text-white" : "bg-cloud text-ink-2"}`}>{job.sourceLabel ?? "Job advert"}</span>
                {job.salary && <span className="font-semibold text-ink">{job.salary}</span>}
              </div>
              <p className="mt-2 text-[21px] font-semibold leading-snug tracking-[-0.02em] text-ink">{job.title}</p>
              <p className="text-[15px] text-ink-2">
                {job.company}
                {job.location ? <span className="text-mute"> · {job.location}</span> : null}
              </p>
              {fit && fit.match !== null && (
                <div className="mt-4 rounded-2xl bg-cloud p-4">
                  <p className="text-[15px] text-ink">
                    <span className="font-semibold">Your match on your results: {fit.match}%.</span>{" "}
                    {fit.missing.length > 0 ? `The advert also asks for ${fit.missing.slice(0, 4).join(", ")}: we will list anything your CV does not show as a gap.` : ""}
                  </p>
                </div>
              )}
              {job.fullText ? (
                <details className="mt-4 text-[15px]">
                  <summary className="cursor-pointer font-medium text-link">We have the whole advert. Show it</summary>
                  <div className="mt-3 max-h-[320px] overflow-y-auto whitespace-pre-line rounded-2xl bg-cloud p-4 text-[14px] leading-relaxed text-ink-2">{job.description}</div>
                </details>
              ) : (
                <div className="mt-5">
                  <p className="text-[15px] text-ink-2">
                    {job.sourceLabel ?? "The job board"} only gives us a summary of this advert. Paste the whole advert so your pack covers everything the employer asks for.{" "}
                    {job.url && /^https?:/.test(job.url) && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                        Open the advert<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                  {job.description && (
                    <blockquote className="mt-3 rounded-2xl bg-cloud px-4 py-3 text-[14px] leading-relaxed text-mute">
                      <span className="font-medium text-ink-2">The summary we have: </span>
                      {job.description}
                    </blockquote>
                  )}
                  <label htmlFor="advert" className="field-label mt-4">
                    The whole job advert
                  </label>
                  <textarea
                    id="advert"
                    className="field min-h-[200px] !text-[15px]"
                    value={advert}
                    placeholder="Copy everything from the job page and paste it here."
                    onChange={(e) => setAdvert(e.target.value.slice(0, 12_000))}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="job-title" className="field-label">
                    Job title
                  </label>
                  <input id="job-title" className="field" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Maintenance engineer" />
                </div>
                <div>
                  <label htmlFor="job-company" className="field-label">
                    Employer <span className="font-normal text-mute">(optional)</span>
                  </label>
                  <input id="job-company" className="field" maxLength={160} value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="advert" className="field-label">
                  The whole job advert
                </label>
                <textarea
                  id="advert"
                  className="field min-h-[220px] !text-[15px]"
                  value={advert}
                  onChange={(e) => setAdvert(e.target.value.slice(0, 12_000))}
                  placeholder="Paste everything from the job page: what the job is, what they are looking for, what they offer."
                />
              </div>
            </div>
          )}
        </Step>

        <Step n={2} title="Your CV">
          <CvPicker value={cv} onChange={setCv} saved={acct.saved} resultsToken={from} />
          {acct.signedIn && cv.kind !== "saved" && cv.kind !== "none" && (
            <label className="mt-4 flex items-start gap-3 text-[14px] text-ink-2">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#0071e3]" checked={saveCv} onChange={(e) => setSaveCv(e.target.checked)} />
              <span>Keep this CV on my account so I do not have to upload it again. You can delete it from your account at any time.</span>
            </label>
          )}
        </Step>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="card-white p-5 sm:p-6">
          <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Your pack</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-ink-2">
            <li className="flex gap-2">
              <Check /> Your CV rewritten for this job, ready to download as Word or PDF
            </li>
            <li className="flex gap-2">
              <Check /> The gaps: what the advert asks for that your CV does not show
            </li>
            <li className={`flex gap-2 ${chosen === "free" ? "text-mute" : ""}`}>
              <Check off={chosen === "free"} /> A cover letter for this job{chosen === "free" ? " (not in the free CV)" : ""}
            </li>
            <li className={`flex gap-2 ${chosen === "free" ? "text-mute" : ""}`}>
              <Check off={chosen === "free"} /> Interview prep: likely questions with answers drawn from your CV{chosen === "free" ? " (not in the free CV)" : ""}
            </li>
          </ul>

          {options.length > 1 && (
            <fieldset className="mt-5 space-y-2">
              <legend className="sr-only">How to pay</legend>
              {options.map((o) => (
                <label key={o} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 ${chosen === o ? "border-blue bg-[#f0f6ff]" : "border-hair"}`}>
                  <input type="radio" name="pay" className="mt-1 accent-[#0071e3]" checked={chosen === o} onChange={() => setPay(o)} />
                  <span className="text-[14px] leading-snug">
                    {o === "plus" && (
                      <>
                        <strong className="block text-[15px] text-ink">Included with Plus</strong>
                        <span className="text-mute">{acct.plusLeft !== null ? `${acct.plusLeft} of ${PLUS_PACKS_PER_MONTH} packs left this month` : "Part of your plan"}</span>
                      </>
                    )}
                    {o === "free" && (
                      <>
                        <strong className="block text-[15px] text-ink">Free tailored CV</strong>
                        <span className="text-mute">Your one free try{acct.signedIn ? "" : ": sign in with your email to use it"}</span>
                      </>
                    )}
                    {o === "card" && (
                      <>
                        <strong className="block text-[15px] text-ink">Job pack, {PACK_PRICE_LABEL}</strong>
                        <span className="text-mute">CV, cover letter and interview prep. One payment.</span>
                      </>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {options.length === 1 && chosen === "free" && (
            <p className="mt-5 rounded-2xl bg-cloud px-4 py-3 text-[14px] text-ink-2">
              <strong className="text-ink">Free tailored CV.</strong> Each person gets one to try. {acct.signedIn ? "" : "Sign in with your email to use it."}
            </p>
          )}
          {!paymentsOpen && (
            <p className="mt-3 text-[13px] leading-snug text-mute">Card payments open shortly, so the {PACK_PRICE_LABEL} pack and Plus are not on sale today.</p>
          )}
          {options.length === 0 && (
            <p className="mt-5 rounded-2xl bg-cloud px-4 py-3 text-[14px] text-ink-2">
              You have used your free tailored CV{acct.plus ? ` and this month's ${PLUS_PACKS_PER_MONTH} Plus packs` : ""}. Card payments open shortly.
            </p>
          )}

          <div className="mt-5">
            {chosen === "free" && !acct.signedIn ? (
              <div>
                {waiting && (
                  <p role="status" className="mb-3 flex items-center gap-2 text-[14px] text-ink-2">
                    <span className="live-dot" aria-hidden="true" /> Waiting for you to sign in. Press the button in the email; this page carries on by itself.
                  </p>
                )}
                <CandidateSignInForm next={here} compact onSent={onSent} />
              </div>
            ) : chosen ? (
              <div className="space-y-3">
                {chosen === "card" && !acct.signedIn && (
                  <div>
                    <label htmlFor="pack-email" className="field-label">
                      Your email
                    </label>
                    <input id="pack-email" type="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="So we can send you the link" />
                  </div>
                )}
                {chosen === "card" && (
                  <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-2">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>{PACK_CONSENT_TEXT}</span>
                  </label>
                )}
                <button type="button" className="btn btn-primary w-full" disabled={busy || !ready} onClick={() => void start()}>
                  {busy ? "Starting..." : label}
                </button>
                {acct.signedIn && <p className="text-center text-[13px] text-mute">Signed in as {acct.email}</p>}
              </div>
            ) : null}
            {error && (
              <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="tile p-5 text-[14px] text-ink-2">
          <p>
            <strong className="text-ink">How it is written.</strong> An AI model (Claude, by Anthropic) rewrites your CV for this advert, then our own checks take out
            any employer, date, qualification, skill or figure that is not in your CV. You read and edit everything before you download it.
          </p>
          {!acct.plus && (
            <p className="mt-3">
              Applying for lots of jobs?{" "}
              <Link href="/plus" className="text-link hover:underline">
                Plus is {PLUS_PRICE_LABEL} a month
              </Link>{" "}
              for up to {PLUS_PACKS_PER_MONTH} packs.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
