import Link from "next/link";

// Application tracker section of /terms. Kept in its own file so edits to the
// rest of the page never collide with it.

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";

export function TrackingTerms() {
  return (
    <section aria-labelledby="tracking" className="space-y-4">
      <h2 id="tracking" className={h2}>
        Application tracker and check-ins
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          The application tracker is free. It lists jobs you applied for through MatchMySkillset and outside jobs you tell us you applied for, and we email you 7 and
          21 days after each application to ask how it went. You can stop those emails, or delete anything in the tracker, at any time.
        </li>
        <li>Only track your own applications, with your own email address, and keep your tracker link private: anyone with it can see and change your tracker.</li>
        <li>
          Your answers should be true to the best of your knowledge. For a job you applied to through MatchMySkillset, an answer of interview, offer or placed is shown
          to that employer as &ldquo;Candidate says&rdquo;; other answers are not.
        </li>
        <li>
          If you tell us you got a job, we may ask you once, by email, whether we can mention your move, anonymised, in our case studies. Saying no, or not answering,
          changes nothing else.
        </li>
        <li>
          The tracker does not apply for jobs for you, and we do not promise any outcome from an application. How we use tracking data is in our{" "}
          <Link href="/privacy#tracking" className="text-link underline">
            Privacy Policy
          </Link>
          .
        </li>
      </ul>
    </section>
  );
}
