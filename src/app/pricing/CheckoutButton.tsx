"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutButton({
  planId,
  label,
  className,
}: {
  planId: string;
  label: string;
  className: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      // Pass the logged-in user so the Stripe webhook can map the payment back
      // to this account and unlock Pro. If not signed in, send them to sign up
      // first, then back to pricing to complete the purchase.
      let userId: string | undefined;
      let email: string | undefined;
      try {
        const { data } = await createClient().auth.getUser();
        userId = data?.user?.id;
        email = data?.user?.email || undefined;
      } catch {
        /* treat as anonymous */
      }

      if (!userId) {
        window.location.href = `/signup?plan=${planId.split("_")[0]}&next=/pricing`;
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId, email }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || "Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={start}
        disabled={loading}
        className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? "Starting checkout..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
