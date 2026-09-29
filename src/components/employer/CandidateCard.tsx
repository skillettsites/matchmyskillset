import type { RankedCandidate } from "@/lib/employer/candidates";
import { topSkillNames } from "@/lib/employer/matching";
import type { ContactStatus } from "@/lib/employer/types";
import { ContactRequestForm } from "./ContactRequestForm";
import { Badge, MatchBar, RankDot, RecruiterNote, SkillChip } from "./ui";

// An anonymous profile: no name, email, phone or CV until the person accepts.

const CONTACT: Record<ContactStatus, { label: string; tone: "amber" | "green" | "grey" }> = {
  pending: { label: "Request sent, waiting for their answer", tone: "amber" },
  accepted: { label: "Accepted: see Contact requests", tone: "green" },
  declined: { label: "Declined", tone: "grey" },
  expired: { label: "No answer (expired)", tone: "grey" },
};

export function CandidateCard({
  ranked,
  showScore,
  contact,
  jobs,
  defaultJobId,
  canContact,
  note,
  rank,
}: {
  ranked: RankedCandidate;
  showScore: boolean;
  contact?: ContactStatus;
  jobs: { id: string; title: string }[];
  defaultJobId?: string;
  canContact: boolean;
  /** A recruiter's note, on a recruiter shortlist. */
  note?: string | null;
  /** Position on a recruiter shortlist. */
  rank?: number;
}) {
  const { candidate: c, skills, match } = ranked;
  const top = topSkillNames(skills, match.matched, 10);
  const facts = [c.current_role, c.region, typeof c.years_experience === "number" ? `${c.years_experience} ${c.years_experience === 1 ? "year" : "years"} of experience` : null].filter(
    Boolean
  );
  return (
    <div className="rounded-[22px] bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_280px] sm:items-start">
        <div className="flex min-w-0 gap-3">
          {rank !== undefined && <RankDot rank={rank} />}
          <div className="min-w-0">
            <p className="text-[17px] font-semibold leading-snug text-ink">{c.headline || c.current_role || "Candidate"}</p>
            {facts.length > 0 && <p className="mt-1 text-[14px] text-mute">{facts.join(" · ")}</p>}
          </div>
        </div>
        {showScore && <MatchBar score={match.score} />}
      </div>
      {top.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {top.map((s) => (
            <SkillChip key={s.name} name={s.name} match={s.match} />
          ))}
        </div>
      )}
      {note && <RecruiterNote note={note} />}
      <div className="mt-5">
        {contact && contact !== "expired" ? (
          <Badge tone={CONTACT[contact].tone}>{CONTACT[contact].label}</Badge>
        ) : canContact ? (
          <ContactRequestForm candidateId={c.id} jobs={jobs} defaultJobId={defaultJobId} />
        ) : (
          <p className="text-[13px] text-mute">Choose a plan to contact candidates.</p>
        )}
      </div>
    </div>
  );
}
