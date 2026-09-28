# MatchMySkillset components

Everything here is a server component unless marked otherwise. Import content
components from the barrel:

```tsx
import { PageHeader, Breadcrumbs, RouteCard, DataTable, SourceNote } from "@/components/content";
```

## Design rules (v3, ported from We Build Your Ideas)

- **Tokens live in `src/app/globals.css`.** Colours: `ink`, `ink-2`, `mute`,
  `mute-2` (placeholders only), `line`, `hair`, `cloud`, `snow`, `blue`,
  `link`, `green`, `green-soft`, `orange`, `sky`. Type sizes for content pages:
  `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lede`. Widths:
  `max-w-page` (1128px, with `px-4 sm:px-6` it lines up with the header) and
  `max-w-reading`.
- **Component classes** (in `@layer components`, so utilities still win):
  `.display-hero .display .headline .title .lede .eyebrow .kicker
  .gradient-text`, `.btn` with `.btn-primary .btn-secondary .btn-dark
  .btn-light .btn-quiet .btn-ghost-light .btn-lg .btn-sm`, `.link-more`,
  `.card-white .tile .pill .glass .hairline`, `.field .field-label
  .field-hint`, `.segmented`, `.hero-glow` (still; add `.hero-glow-drift` to animate it),
  `.live-dot`, `.rise .rise-1
  .rise-2 .rise-3`, `.prose-apple`, `.prose-mms`, `.link`, `.mms-table`,
  `details.faq` + `.faq-icon`.
- **Look:** white pages, one gradient word per hero, grey ledes, blue pill
  buttons, rounded (20 to 28px) cards with soft shadows or cloud tiles, lots of
  space. Alternate white and cloud bands; at most one black band per page.
- **Contrast:** `text-blue` only on white. On cloud or over a glow use
  `text-link`. `gradient-text` is for large text only (3:1 minimum).
- **Font:** Inter via next/font (`--font-inter`) behind the Apple system
  stack. There is no serif any more: `font-serif` is mapped to the display sans
  so old markup still renders in the new look.
- **Legacy names** (`bg-paper`, `bg-surface`, `text-muted`, `border-rule`,
  `text-accent`, `bg-accent-wash`, `bg-highlight-soft`, `bg-night`, and the
  remapped `indigo`, `purple`, `green` and `gray` scales) still resolve, to the
  new palette, so untouched pages match. Do not use them in new code.
- **No number without a source.** Every salary, count or percentage gets a
  `SourceNote`. If you cannot cite it, leave the prop out.
- **No em dashes, UK English, no invented reviews, ratings, user counts, jobs,
  candidates or companies.** Mockups carry an "Illustration" or "Example" tag.
- **Touch targets are at least 44px.** `.btn` is 44px or more; `.btn-sm`
  looks 32px but stretches its tap area to 44px; use `min-h-11` for list links.

## Shell (`components/ui`)

| Component | Notes |
|---|---|
| `Header` | **Client.** Frosted on scroll, links from `PRIMARY_NAV`, "Upload your CV" pill, full-screen mobile menu (closes on link click, Escape and route change). |
| `Footer` | Server component. Job seeker, profession hub, guide and employer columns; About, Privacy, Terms and Cookie settings. |
| `Logo`, `LogoMark` | Two overlapping rings on a teal-to-violet rounded square, plus the wordmark. Same artwork as `public/icon.svg`. |
| `JobCard` | **Client.** One vacancy on /jobs (unchanged in v3 design pass). |

Links come from `components/site.ts` (`PRIMARY_NAV`, `CV_HREF`,
`JOBSEEKER_LINKS`, `EMPLOYER_LINKS`, `JOB_HUBS`, `GUIDE_LINKS`, `FIT_LINKS`,
`TOOL_LINKS`, `COMPANY_LINKS`), which also exports `SITE_NAME`, `SITE_URL`,
`SITE_TAGLINE` and `absoluteUrl()`.

Marketing sections (hero glow, step lists, feature tiles, device frames,
results and employer mockups, CTA band, FAQ) are in `components/marketing`;
see its README.

`JsonLd` (`components/JsonLd.tsx`) renders any schema.org object safely
(`<` escaped). The root layout already emits `Organization` and `WebSite`.

## Content components (`components/content`)

### `PageHeader`
Top of every content page over a soft colour glow: breadcrumbs slot, blue
eyebrow (`kicker`), the single H1, grey lede, an "Updated" pill and optional
reviewer.

| Prop | Type | Notes |
|---|---|---|
| `title` | ReactNode | Required. Put the question people ask in it. |
| `kicker` | string | Blue eyebrow above the title. |
| `intro` | ReactNode | Lede. Answer the question in the first 60 words. |
| `updated` | string | ISO date, shown as "Updated 28 September 2026". |
| `reviewedBy` | `{ name, role?, href? }` | Only a real, named person. |
| `breadcrumbs` | ReactNode | Pass `<Breadcrumbs />`. |
| `children` | ReactNode | Shown under the meta line, e.g. `<ToolCallout />`. |

```tsx
<PageHeader
  breadcrumbs={<Breadcrumbs items={[{ name: "Leaving your job", href: "/careers-for" }, { name: "Leaving teaching" }]} />}
  kicker="Leaving teaching"
  title="What jobs can teachers do instead of teaching?"
  intro={<p>...</p>}
  updated="2026-10-22"
/>
```

### `Breadcrumbs`
Visual trail plus `BreadcrumbList` JSON-LD with absolute URLs.

| Prop | Type | Notes |
|---|---|---|
| `items` | `{ name, href? }[]` | Trail after Home. Leave `href` off the last item. |
| `includeHome` | boolean | Default `true`. |
| `schema` | boolean | Default `true`. |

### `SourceNote`
"Source: <linked name>, published 23 October 2025." Put one under every figure,
table or chart.

| Prop | Type | Notes |
|---|---|---|
| `source` | string | Required, e.g. "ONS, Annual Survey of Hours and Earnings 2025, Table 14". |
| `href` | string | Link to the exact table or bulletin. |
| `published` | string | ISO date ("2025-10-23" or "2025-10") or free text. |
| `note` | ReactNode | Extra detail, e.g. "Median gross annual pay, full-time employees, UK." |
| `label` | string | Default "Source". |

### `SalaryFigure`
A pound figure in tabular, lining numerals inside `<data value>`. Renders
nothing if `value` is missing or not a finite number.

| Prop | Type | Notes |
|---|---|---|
| `value` | number | Pounds. |
| `period` | `"year" \| "month" \| "week" \| "hour"` | Default `"year"`. Hourly keeps pence. |
| `showPeriod` | boolean | Default `true` ("a year"). |
| `approximate` | boolean | Prefixes "about". |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `sm` for inline text. |
| `tone` | `"ink" \| "accent" \| "highlight"` | Default `"ink"`. |

```tsx
Median pay was <SalaryFigure value={34512} size="sm" /> in 2025.
```

### `DataTable<Row>`
A real table from 640px; one card per row below that, with the row header as
the card title and column headers as labels. Numeric columns are right-aligned
with tabular figures.

| Prop | Type | Notes |
|---|---|---|
| `caption` | ReactNode | Required. The table's accessible name. |
| `description` | ReactNode | Line under the caption. |
| `columns` | `DataTableColumn<Row>[]` | See below. |
| `rows` | `Row[]` | |
| `rowKey` | `(row, i) => string` | Default index. |
| `source` | ReactNode | Pass `<SourceNote />`. |
| `notes` | ReactNode | Footnotes. |

Column: `key`, `header`, `mobileLabel?`, `numeric?`, `format?: "gbp" | "number"`,
`rowHeader?` (use on the job column), `render?: (row, i) => ReactNode`
(server components only), `className?`. Missing values show "n/a".

```tsx
<DataTable<Row>
  caption="Where teachers go: UK median pay"
  columns={[
    { key: "job", header: "Job", rowHeader: true },
    { key: "median", header: "Median pay", numeric: true, format: "gbp" },
    { key: "route", header: "Typical way in" },
  ]}
  rows={rows}
  source={<SourceNote source="ONS, ASHE 2025, Table 14" href="..." published="2025-10-23" />}
/>
```

### `RouteCard`
A white rounded card with the route motif: open ring (the job now), dotted
line, gradient dot (where you could go). Every number is optional and renders
nothing when absent.

| Prop | Type | Notes |
|---|---|---|
| `from`, `to` | string | Required. |
| `href` | string | Makes the whole card a link. |
| `linkLabel` | string | Default "Read the guide". |
| `summary` | ReactNode | Why the move works. |
| `medianPay` | number | Destination median, pounds. |
| `fromPay` | number | Starting median; used to work out the change. |
| `payChange` | number | Overrides the calculated change. Negative shows in red. |
| `payPeriod` | PayPeriod | Default `"year"`. |
| `entryRoute` | ReactNode | The usual way in. Plain text when `href` is set. |
| `timeToSwitchMonths` | `number \| [min, max]` | "6 to 12 months". |
| `source` | ReactNode | `<SourceNote />`, shown only when pay is shown. |
| `headingLevel` | `2 \| 3 \| 4` | Default 3. |

### `FaqSection`
Native `<details>` questions (no JavaScript) plus `FAQPage` JSON-LD built from
the same items. Use once per page.

| Prop | Type | Notes |
|---|---|---|
| `items` | `FaqItem[]` | `{ question, answer: string }` or `{ question, answer: ReactNode, answerText: string }`. Blank lines in a string answer make paragraphs. |
| `heading` | string | Default "Common questions". |
| `intro` | ReactNode | |
| `id` | string | Default "faq". |
| `headingLevel` | `2 \| 3` | Questions use the next level down. |
| `schema` | boolean | Default `true`. |
| `openFirst` | boolean | Default `false`. |

### `ToolCallout`
Inline call to action: "Upload your CV to see matching jobs", with an
"Upload your CV" button to `/discover` and a "Browse live jobs" link, plus a
small illustrative results preview on wider screens. No JavaScript.

| Prop | Type | Notes |
|---|---|---|
| `current` | string | Adds `?current=` to the upload link. |
| `heading` | string | Default "Upload your CV to see matching jobs" (it then becomes the eyebrow). |
| `body` | ReactNode | Default line on what the CV match does. |
| `headingLevel` | `2 \| 3` | Default 2. |
| `id` | string | Default "check-your-options". Change it if you use two on a page. |

```tsx
<ToolCallout current="teacher" heading="Leaving teaching? See your options" />
```


### `Prose`
Wraps long-form HTML (h2, h3, p, ul, ol, blockquote, a, strong, hr) with the
v3 text styles at reading width.

| Prop | Type | Notes |
|---|---|---|
| `children` | ReactNode | |
| `as` | `"div" \| "article" \| "section"` | Default `"div"`. |
| `fullWidth` | boolean | Removes the reading-width cap. |

### `Disclosure`
Affiliate disclosure line. Put it above the first affiliate link and mark those
links `rel="sponsored"`.

| Prop | Type | Notes |
|---|---|---|
| `children` | ReactNode | Custom wording; defaults to the standard line. |
| `href` | string | Link to a "how we make money" page. |
| `linkLabel` | string | Default "How we make money". |

### Formatting helpers
`formatGBP`, `formatGBPChange` (uses a true minus sign), `formatNumber`,
`formatDate` (ISO to "23 October 2025"), `formatMonths`, all exported from the
barrel.
