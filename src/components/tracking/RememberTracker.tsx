"use client";

import { useEffect } from "react";
import { readTracker, rememberTracker } from "./storage";

/**
 * On the tracker page: remembers this tracker in the browser (unless it
 * already holds another one), so "I applied" on job cards adds to it without
 * asking for the email again.
 */
export function RememberTracker({ token, email }: { token: string; email: string }) {
  useEffect(() => {
    const current = readTracker();
    if (!current) rememberTracker({ token, email });
  }, [token, email]);
  return null;
}
