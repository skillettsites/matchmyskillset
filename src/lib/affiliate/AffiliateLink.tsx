"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/**
 * Link to a paid course or tool that may earn a commission. Always
 * rel="sponsored nofollow noopener", opens in a new tab and records an
 * affiliate_click event. Put a <Disclosure /> above the first one on a page.
 */
export function AffiliateLink({
  href,
  provider,
  placement,
  className = "link",
  children,
}: {
  href: string;
  provider: string;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
      onClick={() => track("affiliate_click", { provider, placement })}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
