// The candidate account behind a request, for linking tracked applications,
// events and placements to it. Server code only.
//
// Guests (no account) still work: their rows have account_id null and are
// grouped by their private tracker link. On sign-in, claimTrackedForAccount()
// attaches guest rows with the same verified email to the account, and /account
// lists them with <TrackerList />. Switching off "Track my applications" on
// /account stops every check-in email to that address (stopAllCheckins()).

import { getCandidate } from "@/lib/candidate/session";

/** Never throws: getCandidate() returns null when signed out or unreachable. */
export async function currentCandidateAccountId(): Promise<string | null> {
  const account = await getCandidate();
  return account?.id ?? null;
}
