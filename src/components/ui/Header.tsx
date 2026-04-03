"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Skip auth if Supabase not configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } catch {
      // Supabase not available
    }
  }, []);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 font-bold text-xl">
          <span className="text-gray-900">Match</span>
          <span className="text-indigo-600">My</span>
          <span className="text-gray-900">Skills</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/discover"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Discover Careers
          </Link>
          <Link
            href="/jobs"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Jobs
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            About
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/discover"
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/discover" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Discover Careers</Link>
          <Link href="/jobs" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Jobs</Link>
          <Link href="/about" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>About</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block w-full text-left text-gray-400 hover:text-gray-600">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/discover" className="block bg-indigo-600 text-white text-center font-medium px-4 py-2 rounded-lg" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
