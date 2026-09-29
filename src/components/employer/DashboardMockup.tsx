// A picture of the employer dashboard for the landing page. Every name and
// number in it is illustrative (it says so on the frame): no real company,
// candidate or result is shown.

const APPLICANTS = [
  { label: "Applicant A", score: 86, skills: ["PLC programming", "Fault finding", "Robotics"], status: "New" },
  { label: "Applicant B", score: 71, skills: ["Preventive maintenance", "Hydraulics", "Fault finding"], status: "Shortlisted" },
  { label: "Applicant C", score: 58, skills: ["CNC machining", "Engineering drawings"], status: "Viewed" },
];

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[1040px]" aria-label="Illustrative example of the employer dashboard" role="img">
      <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#f6f6f8] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto hidden w-full max-w-[340px] truncate rounded-lg bg-white px-3 py-1 text-center text-[12px] text-mute sm:block">
            matchmyskillset.com/employers/dashboard
          </div>
          <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-mute sm:ml-0">Illustrative example</span>
        </div>

        <div className="grid gap-0 md:grid-cols-[250px_1fr]">
          <div className="hidden border-r border-black/[0.06] bg-snow p-5 md:block">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">Your jobs</p>
            {[
              ["Robotics technician", "Live", "12 applicants"],
              ["Maintenance engineer", "Waiting for approval", "0 applicants"],
              ["Quality engineer", "Live", "7 applicants"],
            ].map(([t, s, a], i) => (
              <div key={t} className={`mt-3 rounded-2xl p-3 ${i === 0 ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : ""}`}>
                <p className="truncate text-[13px] font-semibold text-ink">{t}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mute">
                  <span className={`h-1.5 w-1.5 rounded-full ${s === "Live" ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} />
                  {s} · {a}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-mute">Robotics technician · Derby</p>
                <p className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-ink">Applicants</p>
              </div>
              <div className="flex gap-2">
                {[
                  ["Views", "340"],
                  ["Applications", "12"],
                  ["Rate", "3.5%"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-cloud px-3 py-2 text-center">
                    <p className="text-[10px] font-medium text-mute">{k}</p>
                    <p className="text-[15px] font-bold tracking-[-0.02em] text-ink">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {APPLICANTS.map((a) => (
                <div key={a.label} className="rounded-2xl border border-black/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-semibold text-ink">{a.label}</p>
                    <span className="rounded-full bg-cloud px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{a.status}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-cloud">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0071e3] to-[#7d4cdb]" style={{ width: `${a.score}%` }} />
                    </div>
                    <span className="w-[92px] shrink-0 whitespace-nowrap text-right text-[13px] font-bold text-ink">{a.score}% match</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.skills.map((s) => (
                      <span key={s} className="rounded-full bg-[#e8f1fd] px-2.5 py-1 text-[11px] font-medium text-[#0058b0]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
