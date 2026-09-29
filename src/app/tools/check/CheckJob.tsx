"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { lastResultsToken } from "@/components/cv/storage";
import { saveTailorDraft } from "@/components/candidate/draft";
import { MIN_ADVERT_CHARS } from "@/lib/candidate/plans";
import type { PackFit } from "@/lib/candidate/pack-types";

function tone(m: number): string {
  return m >= 75 ? "text-green" : m >= 55 ? "text-blue" : "text-ink-2";
}

export function CheckJob() {
  const [title, setTitle] = useState("");
  const [advert, setAdvert] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needResults, setNeedResults] = useState(false);
  const [fit, setFit] = useState<PackFit | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedResults(false);
    if (title.trim().length < 2) return setError("Add the job title.");
    if (advert.trim().length < MIN_ADVERT_CHARS) return setError(`Paste the whole advert (at least ${MIN_ADVERT_CHARS} characters).`);
    setBusy(true);
    try {
      const res = await fetch("/api/tools/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, advert, from: lastResultsToken() }),
      });
      const d = (await res.json().catch(() => ({}))) as { fit?: PackFit; error?: string; needResults?: boolean };
      if (res.ok && d.fit) {
        setFit(d.fit);
        track("tool_used", { tool: "check_any_job", match: d.fit.match });
      } else {
        setError(d.error || "We could not check that advert. Please try again.");
        setNeedResults(Boolean(d.needResults));
      }
    } catch {
      setError("We could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <form onSubmit={check} className="card-white space-y-4 p-5 sm:p-7">
        <div>
          <label htmlFor="chk-title" className="field-label">
            Job title
          </label>
          <input id="chk-title" className="field" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Robotics technician" />
        </div>
        <div>
          <label htmlFor="chk-advert" className="field-label">
            The whole advert
          </label>
          <textarea id="chk-advert" className="field min-h-[260px] !text-[15px]" value={advert} onChange={(e) => setAdvert(e.target.value.slice(0, 12_000))} />
        </div>
        {error && (
          <p role="alert" className="text-[14px] text-[#b3261e]">
            {error}{" "}
            {needResults && (
              <Link href="/discover" className="font-medium underline">
                Upload your CV
              </Link>
            )}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Checking..." : "Check my match"}
        </button>
      </form>

      <aside aria-live="polite">
        {fit ? (
          <div className="card-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Your match</p>
              <p className={`text-[40px] font-bold tabular-nums tracking-[-0.03em] ${fit.match !== null ? tone(fit.match) : "text-ink"}`}>{fit.match ?? "?"}%</p>
            </div>
            {fit.matched.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-[13px] font-medium text-ink-2">Your matching skills</p>
                <ul className="flex flex-wrap gap-1.5">
                  {fit.matched.slice(0, 8).map((s) => (
                    <li key={s} className="rounded-full bg-green-soft px-2.5 py-1 text-[13px] font-medium text-green">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fit.missing.length > 0 && (
              <p className="mt-3 text-[14px] text-ink-2">
                <span className="font-medium text-ink">The advert also asks for:</span> {fit.missing.slice(0, 6).join(", ")}
              </p>
            )}
            {fit.explain && <p className="mt-3 rounded-xl bg-cloud px-3 py-2 text-[13px] leading-relaxed text-ink-2">{fit.explain}</p>}
            <Link
              href="/tools/tailor"
              className="btn btn-primary btn-sm mt-5 w-full"
              onClick={() => saveTailorDraft({ title, company: "", advert })}
            >
              Tailor my CV for this job
            </Link>
          </div>
        ) : (
          <div className="tile p-5 text-[15px] text-ink-2">
            <p className="font-semibold text-ink">How it works</p>
            <p className="mt-2">
              We find the skills the advert names and compare them with the skills from your latest results. The same advert and CV always get the same score.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
