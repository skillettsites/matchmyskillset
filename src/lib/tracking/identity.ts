// The candidate account behind a request, for linking tracked applications,
// events and placements to it. Server code only.
//
// INTEGRATION NOTE (candidate accounts, branch revamp/tools, migration 009):
// until that work is merged there are no candidate accounts, so this returns
// null and every tracked application is a guest row (account_id null),
// grouped by its private tracker link. After the merge, replace the body with
//   const account = await getCandidate();   // from "@/lib/candidate/session"
//   return account?.id ?? null;
// Nothing else needs to change:
//   * /api/tracker and /api/applications already store it in
//     mms_tracked_applications.account_id (and on events and placements);
//   * trackedForAccount(accountId) in src/lib/tracking/tracker.ts returns the
//     same list the /tracker page shows, for /account to render with
//     <TrackerList rows={...} /> from src/components/tracking/TrackerList.tsx;
//   * on sign-in, claimTrackedForAccount(accountId, email) attaches the guest
//     rows with the same (verified) email to the account;
//   * the account's "Track my applications" setting (tracking_consent_at):
//     when it is switched off, call stopAllCheckins() for one of the
//     account's rows so no more check-ins go to that address.

export async function currentCandidateAccountId(): Promise<string | null> {
  return null;
}
