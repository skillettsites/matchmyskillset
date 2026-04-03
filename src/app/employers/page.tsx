"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminData {
  leads: Array<{
    id: string;
    email: string;
    cv_text?: string;
    skills_summary?: string;
    top_match?: string;
    match_percentage?: number;
    skills_count?: number;
    top_5_matches?: Array<{ title: string; match: number }>;
    created_at: string;
  }>;
  totalAssessments: number;
  totalLeads: number;
  totalClicks: number;
  totalSearches: number;
  clicksBySource: Record<string, number>;
  popularMatches: Array<{ title: string; count: number }>;
}

interface FeaturedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  isHidden: boolean;
  createdAt: string;
}

type Tab = "jobs" | "candidates" | "analytics";

export default function EmployersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", salaryMin: "", salaryMax: "",
    description: "", requiredSkills: "", applicationUrl: "", applicationEmail: "", isHidden: false,
  });

  const loadJobs = useCallback(async () => {
    const res = await fetch("/api/featured-jobs");
    const data = await res.json();
    setJobs(data.jobs || []);
  }, []);

  useEffect(() => {
    loadJobs();
    fetch("/api/admin").then((r) => r.json()).then(setAdminData).catch(() => {});
  }, [loadJobs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/featured-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
          requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setForm({ title: "", company: "", location: "", salaryMin: "", salaryMax: "", description: "", requiredSkills: "", applicationUrl: "", applicationEmail: "", isHidden: false });
        setShowForm(false);
        loadJobs();
      }
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "jobs", label: "Featured Jobs" },
    { id: "candidates", label: "Candidates" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage jobs, candidates, and analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* JOBS TAB */}
      {activeTab === "jobs" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Jobs ({jobs.length})</h2>
            <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              {showForm ? "Cancel" : "+ Add Job"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Operations Manager" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Acme Corp" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. London" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="30000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="50000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Describe the role..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma-separated)</label>
                <input type="text" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Project Management, Team Leadership" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
                  <input type="url" value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Email</label>
                  <input type="email" value={form.applicationEmail} onChange={(e) => setForm({ ...form, applicationEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isHidden" checked={form.isHidden} onChange={(e) => setForm({ ...form, isHidden: e.target.checked })} className="rounded border-gray-300" />
                <label htmlFor="isHidden" className="text-sm text-gray-600">Hidden (unadvertised, only shown to matched candidates)</label>
              </div>
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Add Featured Job"}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {jobs.length === 0 && !showForm && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No featured jobs yet</p>
                <p className="text-sm">Click &quot;+ Add Job&quot; to post your first featured role.</p>
              </div>
            )}
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">Featured</span>
                      {job.isHidden && <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                    {job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.requiredSkills.map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATES TAB */}
      {activeTab === "candidates" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Candidates ({adminData?.leads?.length || 0})</h2>
          </div>

          {(!adminData?.leads || adminData.leads.length === 0) ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-700 mb-2">No candidates yet</h3>
              <p className="text-sm text-gray-500">Candidates will appear here as people complete skills assessments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminData.leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        {lead.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">
                          {lead.skills_count || 0} skills, top match: {lead.top_match || "N/A"} ({lead.match_percentage || 0}%)
                        </div>
                        {lead.skills_summary && (
                          <div className="text-xs text-gray-400 mt-1 truncate">{lead.skills_summary}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString("en-GB")}</div>
                        <svg className={`w-4 h-4 text-gray-400 mt-1 transition-transform ${expandedLead === lead.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {expandedLead === lead.id && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                      {/* Top matches */}
                      {lead.top_5_matches && lead.top_5_matches.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2">TOP CAREER MATCHES</div>
                          <div className="flex flex-wrap gap-2">
                            {lead.top_5_matches.map((m, i) => (
                              <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                {m.title} ({m.match}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {lead.skills_summary && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2">SKILLS</div>
                          <div className="flex flex-wrap gap-1">
                            {lead.skills_summary.split(", ").map((s) => (
                              <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CV Text */}
                      {lead.cv_text && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2">CV / EXPERIENCE</div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {lead.cv_text}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href={`mailto:${lead.email}?subject=Career Opportunity from MatchMySkillset&body=Hi,%0A%0AWe reviewed your skills profile on MatchMySkillset and think you could be a great match for some roles we are working on.%0A%0AWould you be open to a quick chat?`}
                          className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Email Candidate
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(lead.email)}
                          className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Copy Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-indigo-600">{adminData?.totalAssessments || 0}</div>
              <div className="text-sm text-gray-500">Total Assessments</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-green-600">{adminData?.totalLeads || 0}</div>
              <div className="text-sm text-gray-500">Email Leads</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-amber-600">{jobs.length}</div>
              <div className="text-sm text-gray-500">Featured Jobs</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl font-bold text-purple-600">{adminData?.totalClicks || 0}</div>
              <div className="text-sm text-gray-500">Job Clicks</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Click tracking */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Job Click Sources</h3>
              <div className="space-y-2">
                {Object.entries(adminData?.clicksBySource || {}).length > 0
                  ? Object.entries(adminData?.clicksBySource || {}).map(([source, count]) => {
                      const maxClicks = Math.max(...Object.values(adminData?.clicksBySource || {}));
                      return (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{source}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full">
                              <div className="h-2 bg-indigo-400 rounded-full" style={{ width: `${(count / maxClicks) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })
                  : <p className="text-sm text-gray-400">No clicks tracked yet</p>
                }
              </div>
            </div>

            {/* Top career matches */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Popular Career Matches</h3>
              <div className="space-y-2">
                {(adminData?.popularMatches || []).length > 0
                  ? (adminData?.popularMatches || []).map((item) => (
                      <div key={item.title} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.title}</span>
                        <span className="text-xs font-medium text-indigo-600">{item.count} {item.count === 1 ? "match" : "matches"}</span>
                      </div>
                    ))
                  : <p className="text-sm text-gray-400">No assessments completed yet</p>
                }
              </div>
            </div>

            {/* Revenue summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Revenue Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CPC Job Clicks</span>
                  <span className="text-sm font-medium text-gray-900">&pound;0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Affiliate Commissions</span>
                  <span className="text-sm font-medium text-gray-900">&pound;0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Placements (Fred)</span>
                  <span className="text-sm font-medium text-gray-900">&pound;0.00</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-indigo-600">&pound;0.00</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Manual tracking until Supabase connected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
