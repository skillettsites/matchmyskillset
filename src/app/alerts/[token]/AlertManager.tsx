"use client";

import { useState } from "react";
import Link from "next/link";

async function post(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/alerts/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: "We could not reach the server. Please try again." };
  }
}

const FLOORS = [0, 25000, 35000, 45000, 60000];

export function AlertManager({
  token,
  initial,
  askUnsubscribe,
}: {
  token: string;
  initial: { frequency: "daily" | "weekly"; active: boolean; salaryMin: number | null };
  askUnsubscribe: boolean;
}) {
  const [frequency, setFrequency] = useState(initial.frequency);
  const [active, setActive] = useState(initial.active);
  const [salaryMin, setSalaryMin] = useState(initial.salaryMin ?? 0);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function act(body: Record<string, unknown>, done: () => void, message: string) {
    setBusy(true);
    setError("");
    setMsg("");
    const r = await post({ token, ...body });
    setBusy(false);
    if (!r.ok) {
      setError(r.error ?? "Something went wrong. Please try again.");
      return;
    }
    done();
    setMsg(message);
  }

  if (deleted) {
    return (
      <div className="card-white p-6" role="status">
        <p className="title">You are unsubscribed</p>
        <p className="mt-2 text-[17px] text-ink-2">We have deleted this alert, so you will not get any more of these emails.</p>
        <Link href="/discover" className="btn btn-secondary btn-sm mt-5">
          Check my CV again
        </Link>
      </div>
    );
  }

  const unsubscribe = () => act({ action: "delete" }, () => setDeleted(true), "Unsubscribed.");

  return (
    <div className="space-y-5">
      {askUnsubscribe && (
        <div className="card-white p-6">
          <p className="title !text-[24px]">Unsubscribe from these job alerts?</p>
          <p className="mt-2 text-[15px] text-mute">We will delete the alert. You can set up a new one from any results page.</p>
          <button type="button" className="btn btn-primary mt-4" disabled={busy} onClick={unsubscribe}>
            Unsubscribe
          </button>
        </div>
      )}

      <div className="card-white p-6">
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">How often</p>
        <div className="segmented mt-3" role="group" aria-label="How often">
          {(["weekly", "daily"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={frequency === f}
              disabled={busy}
              onClick={() => act({ action: "frequency", frequency: f }, () => setFrequency(f), f === "daily" ? "You will get alerts each morning when there are new jobs." : "You will get alerts on Monday mornings when there are new jobs.")}
            >
              {f === "weekly" ? "Weekly (Mondays)" : "Daily"}
            </button>
          ))}
        </div>

        <p className="mt-6 text-[17px] font-semibold tracking-[-0.02em] text-ink">Minimum salary</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            className="rounded-xl border border-line bg-white px-3 py-2 text-[15px]"
            value={salaryMin}
            disabled={busy}
            onChange={(e) => {
              const v = Number(e.target.value);
              void act({ action: "salary", salaryMin: v }, () => setSalaryMin(v), v ? `Only jobs paying £${v.toLocaleString("en-GB")} or more a year from now on.` : "Jobs at any salary from now on.");
            }}
          >
            {FLOORS.map((f) => (
              <option key={f} value={f}>
                {f ? `£${f.toLocaleString("en-GB")} or more` : "Any salary"}
              </option>
            ))}
          </select>
          {salaryMin > 0 && <span className="text-[13px] text-mute">Adverts without a yearly salary are left out.</span>}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-hair pt-5">
          {active ? (
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act({ action: "pause" }, () => setActive(false), "Paused. We will not email you until you resume.")}>
              Pause alerts
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => act({ action: "resume" }, () => setActive(true), "Resumed.")}>
              Resume alerts
            </button>
          )}
          <button type="button" className="btn btn-sm text-[#b3261e] hover:bg-[#fff2f2]" disabled={busy} onClick={unsubscribe}>
            Delete this alert
          </button>
        </div>
        {msg && (
          <p role="status" className="mt-4 rounded-xl bg-green-soft px-3 py-2 text-[14px] text-ink">
            {msg}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
