"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import type { ToolJob } from "./tool-data";
import { titleInSentence } from "@/lib/text";

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet shrink-0 px-4 py-2 text-[14px]"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard can be blocked; the text is still on screen to select.
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/**
 * Pick the job you do now and see the skills that usually carry over, CV
 * wording for each, and the destination jobs that share the most of them.
 * All data is precomputed on the server and passed in; nothing is fetched.
 */
export function TransferableSkillsTool({ jobs, initialKey }: { jobs: ToolJob[]; initialKey?: string }) {
  const selectId = useId();
  const [key, setKey] = useState(initialKey ?? jobs[0].key);
  const job = jobs.find((j) => j.key === key) ?? jobs[0];

  const groups = useMemo(() => {
    const map = new Map<string, ToolJob[]>();
    for (const j of jobs) map.set(j.group, [...(map.get(j.group) ?? []), j]);
    return [...map.entries()];
  }, [jobs]);

  const allLines = job.skills.map((s) => `- ${s.cv}`).join("\n");

  return (
    <div className="card-white p-5 ring-1 ring-black/[0.05] sm:p-8">
      <label htmlFor={selectId} className="block text-[24px] font-bold tracking-[-0.03em] text-ink">
        What job do you do now?
      </label>
      <select
        id={selectId}
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
          track("tool_used", { tool: "transferable_skills", job: e.target.value });
        }}
        className="field mt-3 w-full sm:max-w-md"
      >
        {groups.map(([group, list]) => (
          <optgroup key={group} label={group}>
            {list.map((j) => (
              <option key={j.key} value={j.key}>
                {j.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="mt-2 text-sm text-mute">
        Not listed?{" "}
        <Link href="/discover" className="link">
          Paste your CV instead
        </Link>{" "}
        and we will pick out your skills from it.
      </p>

      <div aria-live="polite" className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <section aria-labelledby={`${selectId}-skills`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`${selectId}-skills`} className="text-[21px] font-bold tracking-[-0.025em] text-ink">
              Skills you can take with you
            </h2>
            <CopyButton text={allLines} label={`Copy all CV lines for ${job.title}`} />
          </div>
          <p className="mt-1 text-sm text-mute">
            CV-ready lines for a {titleInSentence(job.title)}. Replace the words in square brackets with your own details.
          </p>
          <ul className="mt-4 divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {job.skills.map((s) => (
              <li key={s.name} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 text-ink-2">{s.cv}</p>
                </div>
                <CopyButton text={s.cv} label={`Copy the CV line for ${s.name}`} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-mute">
            {job.median === null
              ? "ONS does not publish a reliable median pay figure for this job."
              : `ONS median full-time pay for this job group: ${GBP.format(job.median)} a year (2025).`}
          </p>
        </section>

        <section aria-labelledby={`${selectId}-dest`}>
          <h2 id={`${selectId}-dest`} className="text-[21px] font-bold tracking-[-0.025em] text-ink">
            Jobs that use the same skills
          </h2>
          <p className="mt-1 text-sm text-mute">
            From our list of career-change destinations, ranked by the skills they share with this job, with more weight
            for skills that are central to both and less for skills almost every job needs.
          </p>
          <ol className="mt-4 space-y-3">
            {job.destinations.map((d) => (
              <li key={d.id} className="rounded-[20px] bg-cloud p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-lg font-semibold text-ink">{d.title}</p>
                  <p className="tabular-nums text-ink">
                    {d.median === null ? (
                      <span className="text-sm text-mute">Pay not published</span>
                    ) : (
                      <>
                        <span className="font-semibold">{GBP.format(d.median)}</span>{" "}
                        <span className="text-sm text-mute">median</span>
                      </>
                    )}
                  </p>
                </div>
                {d.median !== null && <p className="text-xs text-mute">Median for the ONS group &ldquo;{d.socTitle}&rdquo;</p>}
                <p className="mt-1 text-sm text-ink-2">
                  <span className="font-semibold">Shared skills:</span> {d.shared.join(", ")}
                </p>
                <p className="mt-1 text-sm text-ink-2">
                  <span className="font-semibold">Way in:</span> {d.route}
                  {d.degreeUsuallyRequired ? " (degree usually needed)" : ""}
                </p>
              </li>
            ))}
          </ol>
          <Link
            href={`/discover?current=${encodeURIComponent(job.title)}`}
            className="btn btn-primary mt-5 w-full sm:w-auto"
            onClick={() => track("tool_used", { tool: "transferable_skills", action: "to_discover", job: job.key })}
          >
            Upload your CV for jobs that match
          </Link>
        </section>
      </div>
    </div>
  );
}
