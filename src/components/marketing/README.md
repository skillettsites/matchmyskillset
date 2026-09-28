# Marketing section kit

Server components for landing pages (homepage, /employers, /discover intro,
pricing). No client JavaScript. Import from the barrel:

```tsx
import {
  Section, SectionHeading, MoreLink, HeroGlow, StepList, StepTile,
  FeatureTiles, BrowserFrame, PhoneFrame, IllustrationTag,
  ResultsMockup, EmployerMockup, MatchRing, CtaBand, Faq, faqJsonLd, Icon,
} from "@/components/marketing";
```

The homepage (`src/app/page.tsx`) uses almost all of them and is the best
worked example. Global rules (tokens, contrast, no fake content) are in
`src/components/README.md`.

## Page rhythm

White hero with a glow, then bands that alternate `white` and `cloud`, at most
one `dark` band, an FAQ, and a closing `CtaBand`. Sections use
`px-4 sm:px-6 py-20 md:py-28` and a `max-w-[1080px]` container
(`Section` does this for you).

## Components

### `Section`
`<Section tone="white|cloud|dark" width="default|narrow" id labelledBy>`.
Full-width band with standard padding and a centred container.

### `SectionHeading`
Eyebrow, `.headline` title and optional grey lede. `align="center"` for
centred intros. `as="h1"` on a page that starts with it. The eyebrow defaults
to `text-link`; pass `eyebrowClassName="text-blue"` only on plain white.

### `MoreLink`
The blue "Learn more >" link (`.link-more`, 44px tall). `light` on dark bands.

### `HeroGlow`
The blurred colour wheel. Put it first inside a `relative overflow-hidden`
parent and make the content `relative`:

```tsx
<section className="relative overflow-hidden px-4 pt-14 sm:px-6">
  <HeroGlow top="-8%" opacity={0.18} />
  <div className="relative mx-auto max-w-[1080px]">...</div>
</section>
```

### `StepList` and `StepTile`
`StepList steps={[{ title, text }]}`: numbered black discs, for a hero column
(as on WBYI /start). `StepTile n title text>{mockup}</StepTile>`: grey tile
with a small illustrative mockup in the lower well, three in a
`grid gap-5 md:grid-cols-3`.

### `FeatureTiles`
`items={[{ icon, title, text, grad?, href?, linkLabel? }]}`, `surface`
(`white` on a cloud band, `cloud` on white), `columns` 2, 3 or 4. Icons come
from `Icon` (`<Icon.Briefcase />`, `Icon.Users`, `Icon.Bell`, `Icon.Chart`,
`Icon.Shield`, `Icon.Search`, `Icon.Target`, `Icon.Inbox` ...).

### `BrowserFrame`, `PhoneFrame`, `IllustrationTag`
Static device frames for product pictures. `BrowserFrame url="..." dark?`.
Any mockup with made-up content must show an `IllustrationTag` (or the word
"Example") and be `aria-hidden`, with the real explanation in nearby text.

### `ResultsMockup`, `EmployerMockup`, `MatchRing`
Ready-made illustrations of the job seeker results page (jobs first, tabs,
filters, three example jobs with match rings and skill chips) and the employer
view (three anonymous matched candidates, "Request contact"). Titles are
generic, every row says "Example listing" or "Example role", and there are no
company names or salaries. `MatchRing value={86} size={52}` draws one score
ring on its own (colour: green 80+, blue 65+, violet below).

### `CtaBand`
`<CtaBand title text primary={{ href, label }} secondary tone="glow|dark" />`.
The closing band: big centred `.display` line, lede, primary pill and a
`MoreLink`.

### `Faq` and `faqJsonLd`
WBYI-style questions (`<details>`, plus icon that turns to a cross). Items are
`{ q, a }` plain strings so the same text feeds `FAQPage` JSON-LD: render
`<JsonLd data={faqJsonLd(items)} />` once, or pass `schema`. Content pages
keep using `FaqSection` from `@/components/content`, which looks the same.

## Copy rules

UK English, no em dashes, plain words (no "unlock", "leverage", "seamless",
"not just", "revolutionise"). No invented numbers, testimonials, logos, jobs,
candidates or companies. Real figures need a `SourceNote`.
