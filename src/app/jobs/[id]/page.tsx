"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FeaturedJobDetail {
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

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<FeaturedJobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id?.startsWith("featured_")) {
      // External job - we don't have a detail page, redirect would happen at click
      setLoading(false);
      return;
    }

    fetch("/api/featured-jobs")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.jobs || []).find(
          (j: FeaturedJobDetail) => j.id === id
        );
        setJob(found || null);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Job not found</h1>
        <p className="text-gray-500 mb-6">
          This job may have been removed or the link is incorrect.
        </p>
        <Link
          href="/jobs"
          className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to jobs
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          Featured
        </span>
        {job.isHidden && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
            Exclusive Role
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {job.title}
      </h1>
      <p className="text-lg text-gray-600 mb-1">{job.company}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="font-medium text-gray-700">
            {job.salaryMin && `£${(job.salaryMin / 1000).toFixed(0)}k`}
            {job.salaryMin && job.salaryMax && " - "}
            {job.salaryMax && `£${(job.salaryMax / 1000).toFixed(0)}k`}
          </span>
        )}
        <span className="text-gray-400">
          Posted {new Date(job.createdAt).toLocaleDateString("en-GB")}
        </span>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">About This Role</h2>
        <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </div>
      </div>

      {/* Required skills */}
      {job.requiredSkills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply */}
      <div className="bg-indigo-50 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">How to Apply</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Now
            </a>
          )}
          {job.applicationEmail && (
            <a
              href={`mailto:${job.applicationEmail}?subject=Application: ${job.title}`}
              className="flex-1 text-center border border-indigo-200 text-indigo-700 font-medium py-3 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Email Application
            </a>
          )}
          {!job.applicationUrl && !job.applicationEmail && (
            <p className="text-gray-500 text-sm">
              Contact us at hello@matchmyskillset.com to express interest in
              this role. We will connect you with the employer.
            </p>
          )}
        </div>
      </div>

      {/* Discover CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Not sure if this role matches your skills?
        </p>
        <Link
          href="/discover"
          className="text-indigo-600 font-medium hover:text-indigo-700 text-sm"
        >
          Run a free skills assessment to find out
        </Link>
      </div>
    </div>
  );
}
