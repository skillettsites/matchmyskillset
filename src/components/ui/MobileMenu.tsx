"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/components/site";

/** Props for {@link MobileMenu}. */
export interface MobileMenuProps {
  /** Links to show, in order. The last one is styled as the main action. */
  items: NavItem[];
  /** Path of the item to style as the primary button, e.g. "/discover". */
  primaryHref?: string;
}

/**
 * The only client island in the site shell: a menu button for small
 * screens. Closes on link click, on Escape and when the route changes.
 */
export function MobileMenu({ items, primaryHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close when the route changes (derived-state pattern, no effect needed).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-ink hover:bg-paper-2"
      >
        <span>{open ? "Close" : "Menu"}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main menu"
          className="absolute inset-x-0 top-full border-b border-rule bg-paper shadow-lift"
        >
          <ul className="mx-auto max-w-page px-4 pb-4 pt-2">
            {items.map((item) => {
              const current = pathname === item.href;
              const isPrimary = item.href === primaryHref;
              return (
                <li key={item.href} className={isPrimary ? "pt-3" : "border-b border-rule"}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={
                      isPrimary
                        ? "btn btn-primary w-full"
                        : `flex min-h-12 items-center justify-between text-lg ${current ? "font-semibold text-accent" : "text-ink"}`
                    }
                  >
                    {item.label}
                    {!isPrimary && (
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 4l6 6-6 6" />
                      </svg>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
