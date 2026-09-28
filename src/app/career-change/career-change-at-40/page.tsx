import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader, Prose, ToolCallout } from "@/components/content";
import { guideMetadata, REVAMP_DATE } from "@/components/guides/meta";
import { ArticleJsonLd, GuideShell, RelatedLinks } from "@/components/guides/GuideShell";

const PATH = "/career-change/career-change-at-40";
const TITLE = "Career change at 40: where to find our UK guide";
const DESCRIPTION =
  "Our full guide to changing career in your 40s lives on our sister site, AICareerSwap. Here are the links, plus our guides for 30 and 50.";
const H1 = "Changing career at 40";

// Kept out of search results: the full guide for this topic is on AICareerSwap.
export const metadata: Metadata = guideMetadata({ path: PATH, title: TITLE, description: DESCRIPTION, noindex: true });

const AICS_GUIDE = "https://aicareerswap.com/guides/career-change-at-40";

export default function Page() {
  return (
    <GuideShell>
      <ArticleJsonLd path={PATH} headline={H1} description={DESCRIPTION} dateModified={REVAMP_DATE} />
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ name: "Career change", href: "/career-change" }, { name: "Career change at 40" }]} />}
        kicker="Career change"
        title={H1}
        intro={
          <p>
            Our detailed guide to changing career in your 40s is on our sister site, AICareerSwap. It covers planning the
            move, common moves for people in their 40s and the money side, for readers in the UK.
          </p>
        }
        updated={REVAMP_DATE}
      >
        <a href={AICS_GUIDE} className="btn btn-primary btn-lg mt-2" rel="noopener">
          Read the career change at 40 guide on AICareerSwap
          <span aria-hidden="true">&rarr;</span>
        </a>
      </PageHeader>

      <Prose>
        <h2>Our guides for other ages</h2>
        <p>
          If you are nearer one end of your 40s, these cover the same ground for other stages of working life:
        </p>
        <ul>
          <li>
            <Link href="/career-change-at-30">Career change at 30</Link>
          </li>
          <li>
            <Link href="/career-change-at-50">Career change at 50</Link>
          </li>
        </ul>
        <p>
          Whatever your age, the steps are the same: work out what you want to change, check the pay and the way in,
          test the move while you are still earning, then apply with a rewritten CV. Our{" "}
          <Link href="/career-change/how-to-change-careers">step-by-step guide</Link> takes you through each one, with
          the official rules on notice, training time and course funding in England.
        </p>
        <p>
          Age discrimination law covers job applicants as well as people already working for an employer (
          <a href="https://www.acas.org.uk/age-discrimination" className="link" rel="noopener">
            Acas, updated 27 March 2025
          </a>
          ).
        </p>
      </Prose>

      <div className="mt-12">
        <ToolCallout />
      </div>

      <RelatedLinks
        links={[
          { href: "/career-change-at-30", label: "Career change at 30" },
          { href: "/career-change-at-50", label: "Career change at 50" },
          { href: "/career-change/how-to-change-careers", label: "How to change careers in the UK" },
          { href: "/transferable-skills", label: "Find your transferable skills" },
          { href: "/career-change", label: "All career change guides" },
        ]}
      />
    </GuideShell>
  );
}
