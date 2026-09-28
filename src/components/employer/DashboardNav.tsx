"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/employers/dashboard", label: "Jobs", exact: true },
  { href: "/employers/dashboard/candidates", label: "Find candidates" },
  { href: "/employers/dashboard/requests", label: "Contact requests" },
  { href: "/employers/dashboard/company", label: "Company" },
  { href: "/employers/dashboard/billing", label: "Plan and billing" },
];

export function DashboardNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Employer dashboard" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
      <div className="segmented whitespace-nowrap">
        {ITEMS.map((item) => {
          const active = item.exact ? path === item.href || path.startsWith("/employers/dashboard/jobs") : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="inline-block">
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
