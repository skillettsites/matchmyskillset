"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { wordCount, type InterviewPrep, type PackView, type TailoredCv } from "@/lib/candidate/pack-types";
import { PACK_CONSENT_TEXT, PACK_PRICE_LABEL, PACK_PRICE_VALUE, PLUS_PACKS_PER_MONTH } from "@/lib/candidate/plans";
import { Area, CvEditor, PrepEditor } from "./editors";

type Tab = "cv" | "letter" | "prep" | "gaps";

const STAGES_FULL = [
  "Reading the advert",
  "Finding what the employer asks for most",
  "Matching it to your experience",
  "Rewriting your CV",
  "Writing your cover letter",
  "Preparing likely interview questions",
  "Checking every line against your CV",
];
const STAGES_CV = ["Reading the advert", "Finding what the employer asks for most", "Matching it to your experience", "Rewriting your CV", "Checking every line against your CV"];

function Progress({ view }: { view: PackView }) {
  const [since] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const secs = Math.max(0, Math.round((now - since) / 1000));
  const stages = view.extrasPending ? STAGES_FULL.slice(4) : view.scope === "full" ? STAGES_FULL : STAGES_CV;
  // Moves through the stages over about 80 seconds; the last one waits for the answer.
  const at = Math.min(stages.length - 1, Math.floor(secs / (80 / stages.length)));
  return (
    <div className="card-white mx-auto mt-10 max-w-[640px] p-7 sm:p-9" role="status" aria-live="polite">
      <p className="text-[21px] font-semibold tracking-[-0.02em] text-ink">{view.extrasPending ? "Writing your cover letter and interview prep" : "Writing your job pack"}</p>
      <p className="mt-1 text-[15px] text-mute">This takes a minute or two. You can leave this page open, or come back to this link later.</p>
      <ol className="mt-6 space-y-3">
        {stages.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 text-[15px] ${i < at ? "text-ink-2" : i === at ? "font-semibold text-ink" : "text-mute-2"}`}>
            {i < at ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-green-soft text-green" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            ) : i === at ? (
              <span className="grid h-6 w-6 place-items-center" aria-hidden="true">
                <span className="live-dot" />
              </span>
            ) : (
              <span className="grid h-6 w-6 place-items-center" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-hair" />
              </span>
            )}
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[13px] tabular-nums text-mute">{secs} seconds so far</p>
    </div>
  );
}

function Upgrade({ view, plus, plusLeft, paymentsOpen, onDone }: { view: PackView; plus: boolean; plusLeft: number | null; paymentsOpen: boolean; onDone: (v: PackView) => void }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const plusOk = plus && (plusLeft === null || plusLeft > 0);
  async function go(pay: "plus" | "card") {
    setError("");
    if (pay === "card" && !consent) {
      setError("Please tick the box to agree to getting it straight away.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/packs/${view.token}/upgrade`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pay, consent }) });
      const d = (await res.json().catch(() => ({}))) as { pack?: PackView; checkoutUrl?: string; error?: string };
      if (res.ok && d.checkoutUrl) {
        track("begin_checkout", { currency: "GBP", value: PACK_PRICE_VALUE, items: [{ item_id: "job_pack_upgrade", item_name: "Cover letter and interview prep", price: PACK_PRICE_VALUE, quantity: 1 }] });
        window.location.href = d.checkoutUrl;
        return;
      }
      if (res.ok && d.pack) {
        onDone(d.pack);
        return;
      }
      setError(d.error || "We could not start that. Please try again.");
    } catch {
      setError("We could not reach the server. Please try again.");
    }
    setBusy(false);
  }
  return (
    <div className="rounded-2xl bg-cloud p-5 sm:p-6">
      <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Add a cover letter and interview prep</p>
      <p className="mt-1 text-[15px] text-ink-2">
        Your free try covers the tailored CV. The full pack adds a cover letter for this job and likely interview questions with answers drawn from your CV.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {plusOk ? (
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void go("plus")}>
            {busy ? "Starting..." : `Add them with Plus${plusLeft !== null ? ` (${plusLeft} of ${PLUS_PACKS_PER_MONTH} left)` : ""}`}
          </button>
        ) : paymentsOpen ? (
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-2">
              <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{PACK_CONSENT_TEXT}</span>
            </label>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void go("card")}>
              {busy ? "Starting..." : `Add them for ${PACK_PRICE_LABEL}`}
            </button>
          </div>
        ) : (
          <p className="text-[14px] text-mute">Card payments open shortly. You can add them here once they do.</p>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

export function PackEditor(props: { initial: PackView; sessionId: string; paymentsOpen: boolean; owner: boolean; signedIn: boolean; plus: boolean; plusLeft: number | null }) {
  const { sessionId, paymentsOpen, owner, signedIn, plus, plusLeft } = props;
  const [view, setView] = useState<PackView>(props.initial);
  const [cv, setCv] = useState<TailoredCv | null>(props.initial.tailoredCv);
  const [letter, setLetter] = useState<string>(props.initial.coverLetter ?? "");
  const [prep, setPrep] = useState<InterviewPrep | null>(props.initial.interviewPrep);
  const [tab, setTab] = useState<Tab>("cv");
  const [saving, setSaving] = useState<"" | "save" | "approve">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const running = useRef(false);
  const shown = useRef(props.initial);

  const writing = view.status === "queued" || view.status === "generating" || view.status === "awaiting_payment";
  // Back from paying to add the cover letter and interview prep, before the payment is confirmed.
  const upgradePaying = Boolean(sessionId) && view.scope === "cv" && view.status === "ready";

  useEffect(() => {
    shown.current = view;
  }, [view]);

  /** Takes a newer copy of the pack, keeping unsaved edits to any part the server has not changed. */
  const adopt = useCallback((v: PackView) => {
    const prev = shown.current;
    shown.current = v;
    setView(v);
    if (JSON.stringify(prev.tailoredCv) !== JSON.stringify(v.tailoredCv)) setCv(v.tailoredCv);
    if (prev.coverLetter !== v.coverLetter) setLetter(v.coverLetter ?? "");
    if (JSON.stringify(prev.interviewPrep) !== JSON.stringify(v.interviewPrep)) setPrep(v.interviewPrep);
  }, []);

  // Ask for the pack to be written (only one writer wins), and meanwhile check on it every few seconds.
  useEffect(() => {
    if (!(writing || upgradePaying) || running.current) return;
    running.current = true;
    let stop = false;
    let lastKick = 0;
    const kick = async () => {
      lastKick = Date.now();
      try {
        const res = await fetch(`/api/packs/${view.token}/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
        const d = (await res.json().catch(() => ({}))) as { pack?: PackView; error?: string };
        if (!stop && d.pack) adopt(d.pack);
        if (!stop && !res.ok && d.error) setError(d.error);
      } catch {
        // the checks below carry on
      }
    };
    void kick();
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/packs/${view.token}`, { cache: "no-store" });
        const d = (await res.json().catch(() => ({}))) as { pack?: PackView };
        if (stop || !d.pack) return;
        if (d.pack.status === "ready" && d.pack.scope === "cv" && sessionId) {
          // Still waiting for the upgrade payment to be confirmed.
          if (Date.now() - lastKick > 10_000) void kick();
        } else if (d.pack.status === "ready" || d.pack.status === "failed") {
          adopt(d.pack);
        } else if (d.pack.status === "queued" || (d.pack.status === "awaiting_payment" && sessionId)) {
          void kick();
        } else if (d.pack.status === "generating" && Date.now() - lastKick > 90_000) {
          // The writer may have stopped (a claim goes stale after 5 minutes); asking again is harmless.
          void kick();
        }
      } catch {
        // try again on the next tick
      }
    }, 5000);
    return () => {
      stop = true;
      running.current = false;
      clearInterval(timer);
    };
  }, [writing, upgradePaying, view.token, sessionId, adopt]);

  const dirty = useMemo(
    () =>
      JSON.stringify(cv) !== JSON.stringify(view.tailoredCv) || (view.coverLetter !== null && letter !== view.coverLetter) || JSON.stringify(prep) !== JSON.stringify(view.interviewPrep),
    [cv, letter, prep, view]
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(approve: boolean) {
    setSaving(approve ? "approve" : "save");
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/packs/${view.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailoredCv: cv, ...(view.coverLetter !== null ? { coverLetter: letter } : {}), ...(view.interviewPrep ? { interviewPrep: prep } : {}), approve }),
      });
      const d = (await res.json().catch(() => ({}))) as { pack?: PackView; error?: string };
      if (!res.ok || !d.pack) {
        setError(d.error || "We could not save your changes. Please try again.");
        return;
      }
      adopt(d.pack);
      setMessage(approve ? "Approved and saved. Your downloads are ready below." : "Saved.");
      if (approve) track("tool_used", { tool: "job_pack_approved" });
    } catch {
      setError("We could not reach the server. Your changes are still on this page: please try again.");
    } finally {
      setSaving("");
    }
  }

  async function remove() {
    if (!window.confirm("Delete this job pack? This cannot be undone.")) return;
    const res = await fetch(`/api/packs/${view.token}`, { method: "DELETE" });
    if (res.ok) window.location.href = owner ? "/account?deleted=pack" : "/tools";
    else setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "We could not delete it. Please try again.");
  }

  const job = view.job;
  const removed = view.checks?.removed ?? [];

  if (view.status === "awaiting_payment" && !sessionId) {
    return (
      <div className="card-white mx-auto mt-10 max-w-[640px] p-7 text-center">
        <p className="title">Waiting for payment</p>
        <p className="mt-2 text-[15px] text-mute">We have not had the payment for this pack. If you have just paid, this page updates by itself in a moment.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-blue">{view.scope === "full" ? "Job pack" : "Tailored CV"}</p>
          <h1 className="headline mt-2 !text-[32px] sm:!text-[44px]">{job.title}</h1>
          <p className="mt-1 text-[19px] text-ink-2">
            {job.company}
            {job.location ? <span className="text-mute"> · {job.location}</span> : null}
          </p>
        </div>
        {view.fit?.match !== null && view.fit?.match !== undefined && (
          <div className="rounded-2xl bg-cloud px-4 py-3 text-right">
            <p className="text-[13px] text-mute">Your match on your results</p>
            <p className="text-[28px] font-bold tabular-nums tracking-[-0.03em] text-ink">{view.fit.match}%</p>
          </div>
        )}
      </header>

      {writing && <Progress view={view} />}

      {view.status === "failed" && (
        <div role="alert" className="card-white mt-8 max-w-[760px] p-6">
          <p className="text-[19px] font-semibold text-ink">We could not finish your pack</p>
          {view.canRetry ? (
            <>
              <p className="mt-2 text-[15px] text-ink-2">Something went wrong while writing it. Please try again: trying again costs you nothing extra.</p>
              <button type="button" className="btn btn-primary btn-sm mt-4" onClick={() => setView((v) => ({ ...v, status: "queued", error: null }))}>
                Try again
              </button>
            </>
          ) : (
            <p className="mt-2 text-[15px] text-ink-2">
              {view.error === "not_a_cv" ? "The text we were given does not look like a CV, so we could not tailor it. " : "We tried three times and could not write it. "}
              {view.paidVia === "one_off" || view.upgradePaidVia === "one_off"
                ? "You paid for this pack: we have been told, and will put it right or refund you. You can also write to hello@matchmyskillset.com."
                : "Anything it used has been given back, so you can start again with your whole CV."}
            </p>
          )}
        </div>
      )}

      {cv && !writing && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div className="min-w-0">
            <div className="overflow-x-auto no-scrollbar">
              <div className="segmented" role="group" aria-label="Pack sections">
                {(
                  [
                    ["cv", "Tailored CV"],
                    ["letter", "Cover letter"],
                    ["prep", "Interview prep"],
                    ["gaps", `Gaps and checks${view.gaps.length + removed.length ? ` (${view.gaps.length + removed.length})` : ""}`],
                  ] as [Tab, string][]
                ).map(([t, label]) => (
                  <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className="whitespace-nowrap">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-white mt-5 p-5 sm:p-7">
              {tab === "cv" && <CvEditor cv={cv} onChange={setCv} />}
              {tab === "letter" &&
                (view.coverLetter !== null ? (
                  <Area id="letter" label={`Cover letter, ${wordCount(letter)} words`} value={letter} onChange={setLetter} min={18} hint="Separate paragraphs with a blank line. Check the greeting and sign-off." />
                ) : view.extrasPending ? (
                  <p className="text-[15px] text-mute">Being written now.</p>
                ) : (
                  upgradePaying ? (
                    <p role="status" className="flex items-center gap-2 text-[15px] text-ink-2">
                      <span className="live-dot" aria-hidden="true" /> Confirming your payment. Your cover letter and interview prep are written as soon as it is through.
                    </p>
                  ) : (
                    <Upgrade view={view} plus={plus} plusLeft={plusLeft} paymentsOpen={paymentsOpen} onDone={adopt} />
                  )
                ))}
              {tab === "prep" &&
                (prep ? (
                  <PrepEditor prep={prep} onChange={setPrep} />
                ) : view.extrasPending ? (
                  <p className="text-[15px] text-mute">Being written now.</p>
                ) : (
                  upgradePaying ? (
                    <p role="status" className="flex items-center gap-2 text-[15px] text-ink-2">
                      <span className="live-dot" aria-hidden="true" /> Confirming your payment. Your cover letter and interview prep are written as soon as it is through.
                    </p>
                  ) : (
                    <Upgrade view={view} plus={plus} plusLeft={plusLeft} paymentsOpen={paymentsOpen} onDone={adopt} />
                  )
                ))}
              {tab === "gaps" && (
                <div className="space-y-8 text-[15px]">
                  <section>
                    <h3 className="text-[17px] font-semibold text-ink">What the advert asks for that your CV does not show</h3>
                    {view.gaps.length ? (
                      <ul className="mt-3 space-y-3">
                        {view.gaps.map((g) => (
                          <li key={g.requirement} className="rounded-2xl bg-cloud px-4 py-3">
                            <p className="font-semibold text-ink">{g.requirement}</p>
                            {g.note && <p className="mt-0.5 text-ink-2">{g.note}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-mute">We did not find anything the advert asks for that your CV leaves out.</p>
                    )}
                    <p className="mt-3 text-[13px] text-mute">We have not added any of these to your CV. Only mention one if it is true, for example from work your CV leaves out.</p>
                  </section>
                  {(view.checks?.changes.length ?? 0) > 0 && (
                    <section>
                      <h3 className="text-[17px] font-semibold text-ink">What we changed</h3>
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2">
                        {view.checks!.changes.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section>
                    <h3 className="text-[17px] font-semibold text-ink">What our checks took out</h3>
                    {removed.length ? (
                      <ul className="mt-3 space-y-2">
                        {removed.map((r, i) => (
                          <li key={i} className="rounded-2xl border border-hair px-4 py-3">
                            <p className="text-[13px] font-medium text-mute">{r.where}</p>
                            <p className="mt-0.5 text-ink line-through decoration-mute-2">{r.text}</p>
                            <p className="mt-0.5 text-[14px] text-ink-2">{r.why}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-mute">Nothing: every employer, date, qualification, skill and figure we checked is in your CV.</p>
                    )}
                    {(view.checks?.review.length ?? 0) > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
                        {view.checks!.review.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                  {view.fit?.explain && (
                    <section>
                      <h3 className="text-[17px] font-semibold text-ink">How your match was worked out</h3>
                      <p className="mt-2 text-[14px] text-ink-2">{view.fit.explain}</p>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="card-white p-5 sm:p-6">
              <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{view.approvedAt ? "Approved" : "Check it, then approve"}</p>
              <p className="mt-1 text-[14px] text-mute">
                {view.approvedAt
                  ? "You can keep editing: save again to update your downloads."
                  : "Read every section and change anything that is not quite right. Approving saves it and opens the downloads."}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {!view.approvedAt ? (
                  <button type="button" className="btn btn-primary w-full" disabled={Boolean(saving)} onClick={() => void save(true)}>
                    {saving === "approve" ? "Saving..." : "Approve and save"}
                  </button>
                ) : null}
                <button type="button" className={`btn w-full ${view.approvedAt ? "btn-primary" : "btn-secondary"}`} disabled={Boolean(saving) || !dirty} onClick={() => void save(false)}>
                  {saving === "save" ? "Saving..." : dirty ? "Save changes" : "No unsaved changes"}
                </button>
              </div>
              {message && (
                <p role="status" className="mt-3 text-[14px] text-green">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
                  {error}
                </p>
              )}
            </div>

            <div className={`card-white p-5 sm:p-6 ${view.approvedAt ? "" : "opacity-60"}`} aria-disabled={!view.approvedAt}>
              <p className="text-[17px] font-semibold text-ink">Downloads</p>
              {!view.approvedAt && <p className="mt-1 text-[13px] text-mute">Approve your pack to download it.</p>}
              {dirty && view.approvedAt && <p className="mt-1 text-[13px] text-mute">Save your changes first: downloads use the saved version.</p>}
              <ul className="mt-3 space-y-2 text-[15px]">
                {[
                  { doc: "cv", label: "CV", show: true },
                  { doc: "letter", label: "Cover letter", show: view.coverLetter !== null },
                  { doc: "prep", label: "Interview prep", show: Boolean(view.interviewPrep) },
                ]
                  .filter((d) => d.show)
                  .map((d) => (
                    <li key={d.doc} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cloud px-3.5 py-2.5">
                      <span className="font-medium text-ink">{d.label}</span>
                      {view.approvedAt ? (
                        <span className="flex gap-3 text-[14px]">
                          <a className="text-link hover:underline" href={`/api/packs/${view.token}/docx?doc=${d.doc}`} onClick={() => track("tool_used", { tool: "job_pack_download", format: "docx", doc: d.doc })}>
                            Word
                          </a>
                          <a className="text-link hover:underline" href={`/packs/${view.token}/print?doc=${d.doc}`} target="_blank" rel="noopener" onClick={() => track("tool_used", { tool: "job_pack_download", format: "pdf", doc: d.doc })}>
                            PDF<span className="sr-only"> (opens a print page in a new tab)</span>
                          </a>
                        </span>
                      ) : (
                        <span className="text-[14px] text-mute">Word · PDF</span>
                      )}
                    </li>
                  ))}
              </ul>
              <p className="mt-3 text-[12px] text-mute">PDF opens a print page: choose Save as PDF in the print window.</p>
            </div>

            <div className="tile p-5 text-[13px] text-ink-2">
              {view.hasAccount ? (
                <p>{owner ? "This pack is saved in your account." : "This pack belongs to an account. Sign in to see it with your other packs."}</p>
              ) : (
                <p>
                  This page has its own private link. Keep it: the pack is kept for 12 months
                  {view.expiresAt ? ` (until ${new Date(view.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })})` : ""}.{" "}
                  {!signedIn && (
                    <Link href="/account/sign-in" className="text-link hover:underline">
                      Create a free account
                    </Link>
                  )}
                </p>
              )}
              <button type="button" className="mt-3 text-[13px] text-[#b3261e] hover:underline" onClick={() => void remove()}>
                Delete this pack
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
