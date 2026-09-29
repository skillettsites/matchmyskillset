// The candidate account behind a request, for linking tracked applications,
// events and placements to it. Server code only.
//
// INTEGRATION NOTE (candidate accounts, branch revamp/tools): until that work
// is merged there are no candidate accounts, so this returns null and every
// tracked application is a guest row (account_id null), grouped by its private
// tracker link. After the merge, make this return the signed-in candidate's
// account id from that branch's session helper. Nothing else needs to change:
//   * /api/tracker and trackMmsApplication() already store it in
//     mms_tracked_applications.account_id (and on events and placements);
//   * trackedForAccount(accountId) in src/lib/tracking/db.ts returns the same
//     list the /tracker page shows, for the account page to render with
//     <TrackerList rows={...} /> from src/components/tracking/TrackerList.tsx.
//   * On sign-up, rows with the same email and a null account_id can be
//     claimed with claimTrackedForAccount(accountId, email).

export async function currentCandidateAccountId(): Promise<string | null> {
  return null;
}
