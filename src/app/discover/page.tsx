"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_PROMPTS = [
  "I was a secondary school teacher for 8 years, teaching English and Drama. I managed a department of 5, ran the school play, organised parent evenings, mentored NQTs, and led staff training sessions on behaviour management.",
  "I worked as a construction project manager for 15 years. I managed budgets up to 2M, coordinated teams of 30+, handled health and safety compliance, negotiated with subcontractors, and delivered projects on time.",
  "I have been a stay-at-home parent for 5 years. Before that I worked in marketing. During my break I organised school fundraisers, managed the PTA budget, coordinated volunteer teams, ran a local Facebook community group, and did freelance social media work.",
];

export default function DiscoverPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Analysing your experience...",
    "Extracting your skills...",
    "Matching to careers...",
    "Finding your best matches...",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (text.trim().length < 50) {
      setError("Please provide more detail about your experience (at least 50 characters).");
      return;
    }

    setLoading(true);
    setError("");
    setLoadingStep(0);

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 2000);

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Store results in sessionStorage for the results page
      sessionStorage.setItem(
        "assessment",
        JSON.stringify({
          id: data.id,
          skills: data.skills,
          matches: data.matches,
          inputText: text.trim(),
        })
      );

      router.push(`/discover/results?id=${data.id}`);
    } catch {
      setError(
        "Could not connect to the server. Please check your connection and try again."
      );
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not read the file.");
        setFileName("");
        return;
      }

      setText(data.text);
    } catch {
      setError("Could not upload the file. Please try again or paste your CV text.");
      setFileName("");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be uploaded again
      e.target.value = "";
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Discover Your Career Matches
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Tell us about your experience and our AI will find careers you never
          knew existed. We value ALL experience: work, volunteering, parenting,
          caring, hobbies, and side projects.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
            placeholder="Describe your experience... What have you done in your career, volunteer work, education, or life? Include job titles, responsibilities, achievements, skills you have used, and anything you are proud of."
            className="w-full h-64 p-6 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-gray-400"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-400">
            {text.length.toLocaleString()} / 10,000
          </div>
        </div>

        {/* File upload */}
        <div className="mt-3 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? "Reading file..." : "Upload CV"}
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={loading || uploading}
              className="hidden"
            />
          </label>
          {fileName && !uploading && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {fileName}
            </span>
          )}
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Extracting text from {fileName}...
            </div>
          )}
          <span className="text-xs text-gray-400">PDF, DOCX, or TXT (max 5MB)</span>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-6 p-6 bg-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-indigo-700 font-medium">
                {loadingSteps[loadingStep]}
              </span>
            </div>
            <div className="mt-4 flex gap-1">
              {loadingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= loadingStep ? "bg-indigo-600" : "bg-indigo-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Email input */}
        <div className="mt-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            We will send your results to this email. We never spam or share your address.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || text.trim().length < 50 || !email}
          className="mt-4 w-full bg-indigo-600 text-white font-semibold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analysing..." : "Discover My Careers"}
        </button>

        <p className="mt-3 text-center text-sm text-gray-400">
          Free. Takes about 10 seconds.
        </p>
      </form>

      {/* Example prompts */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Not sure what to write? Try an example:
        </h2>
        <div className="space-y-3">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setText(prompt)}
              disabled={loading}
              className="w-full text-left p-4 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors disabled:opacity-50"
            >
              <span className="font-medium text-gray-800">
                {i === 0
                  ? "Teacher"
                  : i === 1
                    ? "Construction PM"
                    : "Career Returner"}
                :
              </span>{" "}
              {prompt.slice(0, 120)}...
            </button>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div className="p-4">
          <div className="text-2xl mb-1">🔒</div>
          <div className="text-xs text-gray-500">
            Your data is never shared with employers without your consent
          </div>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-xs text-gray-500">
            AI-powered analysis in under 15 seconds
          </div>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xs text-gray-500">
            Skills-based matching, not keyword matching
          </div>
        </div>
      </div>
    </div>
  );
}
