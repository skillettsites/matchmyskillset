import type { Metadata } from "next";
import { EnquiryForm } from "@/components/employer/EnquiryForm";
import { Faq, faqJsonLd } from "@/components/employer/Faq";
import { PricingCards } from "@/components/employer/PricingCards";
import { EMPLOYER_FAQS } from "@/lib/employer/faqs";
import { PRICING_TIERS } from "@/lib/employer/plans";
import { SITE_URL } from "@/components/site";

export const metadata: Metadata = {
  title: "Employer pricing: jobs from £199 a month",
  description:
    "Starter £199 a month for 3 live jobs, Growth £499 for 10 with skills-gap reports and a company page, Enterprise from £999, or pay per hire.",
  alternates: { canonical: "/employers/pricing" },
};

export default function EmployerPricingPage() {
  const offers = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Job advertising and candidate matching",
    provider: { "@type": "Organization", name: "MatchMySkillset", url: SITE_URL },
    areaServed: "GB",
    offers: PRICING_TIERS.filter((t) => t.action === "checkout").map((t) => {
      const price = t.price.replace(/[£,]/g, "");
      return {
        "@type": "Offer",
        name: t.name,
        price,
        priceCurrency: "GBP",
        priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "GBP", unitCode: "MON" },
        url: `${SITE_URL}/employers/pricing`,
      };
    }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(EMPLOYER_FAQS)) }} />
      <section className="px-5 pb-12 pt-14 text-center md:pt-20">
        <div className="mx-auto max-w-[820px]">
          <p className="eyebrow rise text-blue">For employers</p>
          <h1 className="display rise rise-1 mt-2">
            Simple <span className="gradient-text">pricing.</span>
          </h1>
          <p className="lede rise rise-2 mx-auto mt-5 max-w-[620px]">
            Post jobs, get applicants matched on skills, and search people who asked to be found. No set-up fee, no minimum term.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20" aria-label="Plans">
        <PricingCards mode="public" />
      </section>

      <section id="enquiry" className="scroll-mt-20 bg-cloud px-5 py-20 md:py-24" aria-labelledby="enquiry-title">
        <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <p className="eyebrow text-blue">Enterprise and pay per hire</p>
            <h2 id="enquiry-title" className="headline mt-2">
              Talk to us.
            </h2>
            <p className="mt-5 max-w-[440px] text-[19px] leading-snug text-mute">
              Tell us what you are hiring for and we will reply by email with a price. You can also use this form for any question about the plans.
            </p>
          </div>
          <EnquiryForm />
        </div>
      </section>

      <section className="px-5 py-20 md:py-28" aria-labelledby="pfaq">
        <div className="mx-auto max-w-[880px]">
          <h2 id="pfaq" className="headline">
            Good to know.
          </h2>
          <div className="mt-10">
            <Faq items={EMPLOYER_FAQS} />
          </div>
        </div>
      </section>
    </>
  );
}
