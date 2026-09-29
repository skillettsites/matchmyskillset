import Link from "next/link";
import { CHECKIN_NOTICE, MARKETING_CONSENT_TEXT } from "@/lib/tracking/constants";
import { CONTACT_EMAIL } from "@/lib/site";

// Application tracking, outcomes and placements section of /privacy. Kept in
// its own file so edits to the rest of the page never collide with it. Must
// match src/lib/tracking/** (retention: tracker.ts delete_after 12 months,
// checkins.ts events 24 months and placements 6 years, placement email
// cleared after 12 months).

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";
const h3 = "mt-6 mb-2 scroll-mt-24 text-[18px] font-semibold text-ink";

export function TrackingPrivacy() {
  return (
    <section aria-labelledby="tracking" className="space-y-4">
      <h2 id="tracking" className={h2}>
        Application tracking, outcomes and placements
      </h2>
      <p>
        We follow what happens after people apply, so you can keep track of your applications and so we can see whether the service leads to interviews and jobs.
        This part explains what that involves.
      </p>

      <h3 className={h3}>When tracking starts</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>When you apply for a job posted on MatchMySkillset.</strong> The apply form says: &ldquo;{CHECKIN_NOTICE}&rdquo; The application is added to a
          private application tracker for your email address.
        </li>
        <li>
          <strong>When you tell us you applied for a job on another site.</strong> After you open a job from your results or the job search, the card can ask
          &ldquo;Did you apply for this job?&rdquo;. Nothing is tracked unless you say yes and, if we do not already have it, give your email address next to the
          same notice. The first time, we email you the private link to your tracker.
        </li>
      </ul>

      <h3 className={h3}>What we keep for each tracked application</h3>
      <p>
        Your email address; the private tracker link; the job&apos;s title, company, location, link, pay (if the advert showed it) and the job site it came from;
        the results link you came from, if any; when you applied; how it stands (applied, no response yet, interview, offer, got the job, or withdrawn); when we sent
        check-in emails and whether you stopped them; and the family of work (for example &ldquo;IT and software&rdquo;) we work out from the job title. Anyone with
        your tracker link can see and change your tracker, so keep it private.
      </p>

      <h3 className={h3}>&ldquo;Did you hear back?&rdquo; emails</h3>
      <p>
        We email you 7 and 21 days after you apply, from jobs@matchmyskillset.com, with one-tap answers: no response yet, interview, offer, or placed. Opening a
        link records nothing; your answer is saved only when you press Confirm on the page it opens. Every email lets you stop asking about that job, or stop all
        check-in emails (your email app&apos;s unsubscribe button does the same). We stop asking once you tell us you got the job or withdrew.
      </p>

      <h3 className={h3}>What employers see</h3>
      <p>
        Employers who post jobs here can mark where your application to them stands: viewed, shortlisted, interview, offer, hired or not taken forward. We record
        each change. For a job you applied to through MatchMySkillset, the employer also sees your own answer to a check-in, but only if it is interview, offer or
        placed, shown as &ldquo;Candidate says: interview&rdquo; (or offer, or placed) next to your application. Employers never see your tracker, your other
        applications, outside jobs you track, or an answer of no response or withdrawn.
      </p>

      <h3 className={h3}>Our journey records</h3>
      <p>
        We keep a log of these steps (applications, status changes, check-ins sent and answered, placements and case-study answers) so our team can count how many
        applications lead to interviews, offers and jobs, by period, family of work and employer. The log holds no names or email addresses: where it needs to link
        steps for the same person, it holds a scrambled version of the email address made with a secret key, which cannot be turned back into the address without
        that key.
      </p>

      <h3 id="placements" className={h3}>
        Placements and case studies
      </h3>
      <p>
        When an employer marks you hired, you tell us you got the job, or our team records it (for example when you or the employer tells us directly), we record a
        placement: the job title, company, location, family of work, which employer account it was with, who confirmed it and when, and your email address.
      </p>
      <p>
        About a day later we send one separate email asking: &ldquo;Can we mention your move, anonymised, in our case studies?&rdquo;. It links to a page with a box
        that is not ticked, which reads: &ldquo;{MARKETING_CONSENT_TEXT}&rdquo; We save your answer with the time and that exact wording. Unless you tick it, we do
        not use your placement in any marketing; if you do, we still never name you or say anything that identifies you. You can change your answer at any time from
        the same link. Separately, placements are counted, as numbers only, in our internal totals.
      </p>

      <h3 className={h3}>Lawful basis</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>Tracking a job you tell us you applied for, and emailing you about it: your consent, which you can withdraw by stopping the emails or deleting it.</li>
        <li>
          Check-ins for applications made through MatchMySkillset, employers&apos; status updates, the journey records and placement records: our legitimate interests
          in following up applications made through our service and measuring whether it works. You can stop the emails at any time and object by emailing us.
        </li>
        <li>Case studies: your consent, given by ticking the box, which you can withdraw at any time.</li>
      </ul>

      <h3 className={h3}>How long we keep it</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>Tracked applications: 12 months after you add them, or sooner if you delete them from your tracker page.</li>
        <li>Journey records: 24 months. They contain no names or email addresses.</li>
        <li>
          Placement records: 6 years, because a placement can be the basis of a pay-per-hire fee to the employer, which we keep for tax. Your email address is removed
          from the placement 12 months after it is recorded. Your case-study answer is kept with the placement.
        </li>
      </ul>

      <h3 className={h3}>Your choices</h3>
      <p>
        From your tracker page you can update, stop check-ins for, or delete any application, or delete the whole tracker. Deleting your &ldquo;Let employers find
        me&rdquo; profile also deletes tracked applications for the same email address. The emails are sent through Resend and the records are stored with Supabase,
        the providers listed above. For anything else, including a copy of your data, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-link underline">
          {CONTACT_EMAIL}
        </a>
        . See also the{" "}
        <Link href="/terms#tracking" className="text-link underline">
          terms for the tracker
        </Link>
        .
      </p>
    </section>
  );
}
