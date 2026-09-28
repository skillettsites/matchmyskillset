"use client";

import { useState, type ReactNode } from "react";
import { markApplicationViewed } from "@/app/employers/dashboard/actions";

// One applicant in the inbox. Opening a new application marks it as viewed.
// The status buttons and the rest of the content are rendered on the server
// and passed in as children.

export function ApplicantCard({ id, isNew, summary, children }: { id: string; isNew: boolean; summary: ReactNode; children: ReactNode }) {
  const [marked, setMarked] = useState(!isNew);
  return (
    <details
      className="group rounded-[22px] bg-white"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && !marked) {
          setMarked(true);
          void markApplicationViewed(id);
        }
      }}
    >
      <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">{summary}</summary>
      <div className="border-t border-black/[0.06] px-5 pb-6 pt-5">{children}</div>
    </details>
  );
}
