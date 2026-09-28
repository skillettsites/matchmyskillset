"use client";

import { useState, type FormEvent } from "react";

// Private page for the recruitment partner. Shows only people who ticked the
// optional recruiter box (see /api/admin). The admin key is held in memory for
// this tab only: it is never written to localStorage, sessionStorage or a
// cookie, so closing or reloading the tab signs out.

interface Lead {
  email: string;
  first_name: string | null;
  current_role: string | null;
  skills_summary: string | null;
  top_5_matches: { title?: string; match?: number }[] | null;
  cv_text: string | null;
  consent_at: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB");
}

export default function EmployersPage() {
  const [key, setKey] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(adminKey: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${adminKey}` },
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 401 ? "That key was not accepted." : data?.error || "Could not load candidates.");
        if (res.status === 401) setSignedIn(false);
        return;
      }
      setLeads(Array.isArray(data?.leads) ? data.leads : []);
      setSignedIn(true);
    } catch {
      setError("Could not load candidates. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (key.trim()) load(key.trim());
  }

  function signOut() {
    setKey("");
    setLeads([]);
    setSignedIn(false);
    setExpanded(null);
  }

  if (!signedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recruitment partner access</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your access key. It is kept only while this tab is open.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="admin-key" className="block text-sm font-medium text-gray-700">
            Access key
          </label>
          <input
            id="admin-key"
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Show candidates"}
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Candidates who opted in ({leads.length})</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load(key.trim())}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Everyone listed ticked the optional box asking to be contacted about roles that fit their
        skills, within the last 12 months, and has not withdrawn. Contact them only about suitable
        roles. If anyone asks to be removed, tell MatchMySkillset so their consent is withdrawn.
      </p>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {leads.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          Nobody has opted in yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const isOpen = expanded === lead.email;
            const matches = Array.isArray(lead.top_5_matches) ? lead.top_5_matches : [];
            return (
              <li key={lead.email} className="rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : lead.email)}
                  className="w-full p-5 text-left"
                >
                  <div className="font-medium text-gray-900">
                    {lead.first_name ? `${lead.first_name} (${lead.email})` : lead.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    {lead.current_role ? `${lead.current_role}. ` : ""}Opted in {formatDate(lead.consent_at)}
                  </div>
                  {lead.skills_summary && (
                    <div className="mt-1 truncate text-xs text-gray-500">{lead.skills_summary}</div>
                  )}
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-gray-100 px-5 pb-5 pt-4">
                    {matches.length > 0 && (
                      <div>
                        <h2 className="mb-2 text-xs font-semibold uppercase text-gray-500">Top career matches</h2>
                        <ul className="flex flex-wrap gap-2">
                          {matches.map((m, i) => (
                            <li key={`${m.title}-${i}`} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                              {m.title}
                              {typeof m.match === "number" ? ` (${m.match}%)` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {lead.cv_text && (
                      <div>
                        <h2 className="mb-2 text-xs font-semibold uppercase text-gray-500">CV</h2>
                        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          {lead.cv_text}
                        </div>
                      </div>
                    )}
                    <a
                      href={`mailto:${encodeURIComponent(lead.email)}`}
                      className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Email candidate
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
