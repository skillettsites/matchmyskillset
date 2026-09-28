"use client";

import { useState } from "react";

export function ContactAnswer({ token, company, acceptText }: { token: string; company: string; acceptText: string }) {
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [done, setDone] = useState<"" | "accepted" | "declined">("");
  const [error, setError] = useState("");

  async function answer(decision: "accept" | "decline") {
    setBusy(decision);
    setError("");
    try {
      const res = await fetch("/api/contact/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, decision }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: "accepted" | "declined" };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(data.status ?? (decision === "accept" ? "accepted" : "declined"));
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setBusy("");
    }
  }

  if (done) {
    return (
      <div className="card-white p-6" role="status">
        <p className="title !text-[24px]">{done === "accepted" ? "Accepted" : "Declined"}</p>
        <p className="mt-2 text-[17px] text-ink-2">
          {done === "accepted"
            ? `${company} can now see your first name, email address and CV in their MatchMySkillset account, and we have told them. They will contact you directly.`
            : `We have let ${company} know, without giving any of your details or a reason.`}
        </p>
      </div>
    );
  }

  return (
    <div className="card-white p-6">
      <p className="text-[15px] text-ink-2">If you accept: {acceptText}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={Boolean(busy)} onClick={() => answer("accept")}>
          {busy === "accept" ? "Sending…" : `Accept and share my details`}
        </button>
        <button type="button" className="btn btn-secondary" disabled={Boolean(busy)} onClick={() => answer("decline")}>
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fff2f2] px-3 py-2 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
