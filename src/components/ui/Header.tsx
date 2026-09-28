"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CV_HREF, PRIMARY_NAV, SITE_NAME } from "@/components/site";
import { Logo } from "@/components/ui/Logo";

/**
 * Site header: clear at the top of the page, frosted glass once you scroll.
 * Desktop shows the text links and the "Upload your CV" pill; small screens
 * get a full-screen menu that closes on link click, Escape and route change.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu when the route changes (derived state, no effect needed).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      // Solid white while the menu is open: backdrop-filter on the header would
      // make it the containing block for the fixed menu panel and clip it.
      className={`sticky top-0 z-50 transition-[background-color,border-color] duration-300 ${
        open
          ? "border-b border-black/[0.08] bg-white"
          : scrolled
            ? "glass border-b border-black/[0.08]"
            : "border-b border-transparent bg-white/0"
      }`}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1128px] items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="-ml-1 inline-flex h-11 shrink-0 items-center rounded-lg px-1" aria-label={`${SITE_NAME}, home`}>
          <Logo />
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {PRIMARY_NAV.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`inline-flex h-11 items-center text-[13px] tracking-[-0.01em] transition-colors ${
                  active(l.href) ? "text-ink" : "text-ink/75 hover:text-ink"
                }`}
                aria-current={active(l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href={CV_HREF} className="btn btn-primary btn-sm hidden sm:inline-flex">
            Upload your CV
          </Link>
          <button
            type="button"
            className="-mr-2 grid h-11 w-11 place-items-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-[18px]" aria-hidden="true">
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`}
              />
            </span>
          </button>
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-[52px] bottom-0 overflow-y-auto bg-white px-8 pb-10 pt-6 transition-[opacity,visibility] duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="space-y-1">
          {[{ href: "/", label: "Home" }, ...PRIMARY_NAV].map((l, i) => (
            <li
              key={l.href}
              style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
              className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
            >
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
                className="block py-2.5 text-[28px] font-semibold tracking-[-0.03em] text-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={CV_HREF} onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">
          Upload your CV
        </Link>
        <p className="mt-4 text-center text-[14px] text-mute">
          Hiring?{" "}
          <Link href="/employers" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center text-link hover:underline">
            Post a job
          </Link>
        </p>
      </div>
    </header>
  );
}
