import { BrowserFrame, IllustrationTag } from "./DeviceFrame";
import { Check, MapPin, Pound } from "./Icons";

// Illustrative content only. No company names, no salaries, no real people:
// every row is labelled "Example listing" and the frame carries an
// "Illustration" tag. Real results pages show live adverts.

interface MockJob {
  title: string;
  meta: string;
  match: number;
  have: string[];
  missing: string[];
}

const JOBS: MockJob[] = [
  {
    title: "Operations Manager",
    meta: "Example listing · Leeds · Full time",
    match: 86,
    have: ["Team leadership", "Scheduling", "Budgeting"],
    missing: ["Lean methods"],
  },
  {
    title: "Project Coordinator",
    meta: "Example listing · Hybrid · Full time",
    match: 74,
    have: ["Planning", "Stakeholder management"],
    missing: ["PRINCE2"],
  },
  {
    title: "Learning and Development Adviser",
    meta: "Example listing · Remote · Full time",
    match: 63,
    have: ["Training delivery", "Coaching"],
    missing: ["CIPD qualification", "E-learning tools"],
  },
];

function tone(match: number) {
  if (match >= 80) return { ring: "#30d158", text: "text-green" };
  if (match >= 65) return { ring: "#0071e3", text: "text-link" };
  return { ring: "#bf5af2", text: "text-[#7d4cdb]" };
}

/** A circular match score. Illustrative: pass the number you want drawn. */
export function MatchRing({ value, size = 52 }: { value: number; size?: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const t = tone(value);
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e8e8ed" strokeWidth="4.5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={t.ring}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
        />
      </svg>
      <span className={`relative font-bold tracking-[-0.03em] ${t.text}`} style={{ fontSize: size >= 52 ? 13 : 11 }}>
        {value}%
      </span>
    </span>
  );
}

function JobRow({ job }: { job: MockJob }) {
  return (
    <li className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] sm:gap-4 sm:p-4">
      <MatchRing value={job.match} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink">{job.title}</p>
            <p className="mt-0.5 text-[12px] text-mute">{job.meta}</p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-blue px-3 py-1 text-[12px] font-medium text-white sm:inline-flex">View advert</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.have.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-medium text-green">
              <Check className="h-3 w-3" />
              {s}
            </span>
          ))}
          {job.missing.map((s) => (
            <span key={s} className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-mute ring-1 ring-inset ring-black/[0.12]">
              To learn: {s}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

/**
 * The job-seeker results page as a picture: tabs, filters and three scored
 * example jobs in a browser frame. Decorative (aria-hidden); describe what it
 * shows in the text next to it.
 */
export function ResultsMockup({ rows = 3, className = "" }: { rows?: 1 | 2 | 3; className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <BrowserFrame url="matchmyskillset.com/results">
        <div className="bg-cloud p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">Your matches</p>
              <p className="mt-0.5 text-[17px] font-bold tracking-[-0.025em] text-ink sm:text-[19px]">Jobs you could apply for now</p>
            </div>
            <IllustrationTag className="bg-white" />
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="segmented">
              <span className="rounded-[8px] bg-white px-3 py-1 text-[12px] font-medium text-ink shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.04)]">
                Jobs for you
              </span>
              <span className="px-3 py-1 text-[12px] font-medium text-ink">Careers that fit</span>
              <span className="hidden px-3 py-1 text-[12px] font-medium text-ink sm:inline">Your skills</span>
            </span>
          </div>

          <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-black/[0.06]">
              <MapPin className="h-3 w-3 text-mute" />
              Leeds, 10 miles
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-black/[0.06]">
              <Pound className="h-3 w-3 text-mute" />
              Salary filter
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white">Stay in my field</span>
            <span className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-black/[0.06]">
              Try something new
            </span>
          </div>

          <ul className="mt-3.5 space-y-2.5">
            {JOBS.slice(0, rows).map((j) => (
              <JobRow key={j.title} job={j} />
            ))}
          </ul>
        </div>
      </BrowserFrame>
    </div>
  );
}

interface MockCandidate {
  label: string;
  meta: string;
  match: number;
  skills: string[];
}

const CANDIDATES: MockCandidate[] = [
  { label: "Candidate A", meta: "Operations lead · Yorkshire · 8 years", match: 88, skills: ["Scheduling", "Team leadership", "Budgeting"] },
  { label: "Candidate B", meta: "Shift manager · Leeds · 5 years", match: 79, skills: ["Rota planning", "Health and safety"] },
  { label: "Candidate C", meta: "Logistics coordinator · Remote · 6 years", match: 71, skills: ["Stock control", "Reporting"] },
];

/**
 * The employer view as a picture: anonymous matched candidates for one
 * example role. Decorative (aria-hidden). Shows the privacy model: no names
 * until the candidate accepts a contact request.
 */
export function EmployerMockup({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={className} aria-hidden="true">
      <BrowserFrame url="matchmyskillset.com/employers" dark={dark}>
        <div className="bg-cloud p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">Matched candidates</p>
              <p className="mt-0.5 text-[17px] font-bold tracking-[-0.025em] text-ink">Operations Manager</p>
              <p className="text-[12px] text-mute">Example role</p>
            </div>
            <IllustrationTag className="bg-white" />
          </div>
          <ul className="mt-3.5 space-y-2.5">
            {CANDIDATES.map((c) => (
              <li key={c.label} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-black/[0.04]">
                <MatchRing value={c.match} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink">{c.label}</p>
                  <p className="text-[12px] text-mute">{c.meta}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <span key={s} className="rounded-full bg-cloud px-2 py-0.5 text-[11px] font-medium text-ink-2">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full px-3 py-1 text-[12px] font-medium text-blue ring-1 ring-inset ring-blue sm:inline-flex">
                  Request contact
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-mute">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            Names and CVs stay hidden until the candidate says yes.
          </p>
        </div>
      </BrowserFrame>
    </div>
  );
}
