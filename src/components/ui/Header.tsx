import Link from "next/link";
import { PRIMARY_NAV, SITE_NAME } from "@/components/site";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "@/components/ui/MobileMenu";

const CV_HREF = "/discover";

/**
 * Site header. A server component: no auth, no Supabase, no client state.
 * The only JavaScript it ships is the small {@link MobileMenu} island.
 *
 * Both layouts show the three text links first and "Analyse my CV" last,
 * styled as the main button, so the primary action is always in the same
 * place.
 */
export function Header() {
  const textLinks = PRIMARY_NAV.filter((item) => item.href !== CV_HREF);
  const mobileItems = [...textLinks, ...PRIMARY_NAV.filter((i) => i.href === CV_HREF)];

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="-ml-1 inline-flex min-h-11 items-center rounded-md px-1"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {textLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] font-medium text-ink-2 underline-offset-[0.35em] hover:text-accent hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pl-2">
              <Link href={CV_HREF} className="btn btn-primary">
                Analyse my CV
              </Link>
            </li>
          </ul>
        </nav>

        <MobileMenu items={mobileItems} primaryHref={CV_HREF} />
      </div>
    </header>
  );
}
