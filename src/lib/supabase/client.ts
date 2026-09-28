import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// TEMPORARY COMPATIBILITY SHIM. Delete this file once nothing imports it.
//
// Accounts were removed in the September 2026 revamp, so MatchMySkillset no
// longer talks to Supabase Auth from the browser. Two files owned by other
// workstreams still import createClient() from here:
//   - src/components/ui/Header.tsx         (Sign in / Dashboard links)
//   - src/app/pricing/CheckoutButton.tsx   (old subscription checkout)
// This stub keeps them compiling and makes them behave as signed out, without
// shipping supabase-js to every page. It never makes a network call.

type SignedOutUser = { data: { user: User | null }; error: null };

export function createClient() {
  return {
    auth: {
      async getUser(): Promise<SignedOutUser> {
        return { data: { user: null }, error: null };
      },
      onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        void callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signOut(): Promise<{ error: null }> {
        return { error: null };
      },
    },
  };
}
