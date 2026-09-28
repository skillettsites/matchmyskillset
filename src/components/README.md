# MatchMySkillset components

Everything here is a server component unless marked otherwise. Import content
components from the barrel:

```tsx
import { PageHeader, Breadcrumbs, RouteCard, DataTable, SourceNote } from "@/components/content";
```

## Design rules

- **Tokens live in `src/app/globals.css`.** Use the named colours (`bg-paper`,
  `bg-surface`, `text-ink`, `text-ink-2`, `text-muted`, `border-rule`,
  `bg-accent`, `text-accent`, `bg-accent-wash`, `bg-highlight-soft`,
  `text-highlight-ink`, `text-negative`, `bg-night`), the type sizes
  (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lede`) and the
  widths (`max-w-page`, `max-w-reading`). Do not add new indigo, purple or gray
  utilities: those scales are only remapped so older pages still match.
- **Fonts:** `font-serif` (Fraunces) for page and section titles, `font-sans`
  (Source Sans 3) for everything else. `h1` and `h2` are serif by default.
- **Amber is for data only.** Use `highlight` as a fill (pay-change chips,
  markers). Never as text on paper; it fails contrast.
- **No number without a source.** Every salary, count or percentage gets a
  `SourceNote`. If you cannot cite it, leave the prop out: the components
  render nothing for missing numbers.
- **No em dashes, UK English, no invented reviews, ratings or user counts.**
- **Touch targets are at least 44px tall.** Use `.btn` (44px) or
  `.btn btn-lg` (52px) for buttons, `min-h-11` for list links.
- Utility classes also available: `.btn-primary`, `.btn-secondary`,
  `.btn-quiet`, `.link`, `.kicker`, `.prose-mms`.

## Shell (`components/ui`)

| Component | Notes |
|---|---|
| `Header` | Server component. Logo, three text links and the "Analyse my CV" button. No auth, no Supabase. |
| `MobileMenu` | **Client.** The only JavaScript in the shell. Closes on link click, Escape and route change. |
| `Footer` | Server component. Hub links, guides, tools, About, Privacy, Terms. |
| `Logo`, `RouteMark` | Brand mark (ring, dotted route, dot with amber core) and wordmark. `tone="dark"` on night backgrounds. |
| `JobCard` | **Client.** One vacancy on /jobs. Props unchanged (`job: UnifiedJob`). |

Links for all of these come from `components/site.ts` (`PRIMARY_NAV`,
`JOB_HUBS`, `GUIDE_LINKS`, `FIT_LINKS`, `TOOL_LINKS`, `COMPANY_LINKS`), which
also exports `SITE_NAME`, `SITE_URL` and `absoluteUrl()`. Change a hub URL
there once and the header, footer, homepage and 404 all follow.

`JsonLd` (`components/JsonLd.tsx`) renders any schema.org object safely
(`<` escaped). The root layout already emits `Organization` and `WebSite`.

## Content components (`components/content`)

### `PageHeader`
Top of every content page: breadcrumbs slot, kicker, the single H1, lede,
"Updated" date and optional reviewer.

| Prop | Type | Notes |
|---|---|---|
| `title` | ReactNode | Required. Put the question people ask in it. |
| `kicker` | string | Small green label above the title. |
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
The route motif: open ring (the job now), dotted line, solid dot (where you
could go). Every number is optional and renders nothing when absent.

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
Inline entry point to the personal analysis: a "Paste my CV" button and a
"type the job you do now" GET form, both going to `/discover`. Works without
JavaScript.

| Prop | Type | Notes |
|---|---|---|
| `current` | string | Prefills the job box and adds `?current=` to the CV link. |
| `heading` | string | Default "See where your experience could take you". |
| `body` | ReactNode | Default free, no-account copy. |
| `headingLevel` | `2 \| 3` | Default 2. |
| `id` | string | Default "check-your-options". Change it if you use two on a page. |

```tsx
<ToolCallout current="teacher" heading="Leaving teaching? See your options" />
```

`/discover` reads `current` and pre-selects that job in the "Start from your job" box.

### `Prose`
Wraps long-form HTML (h2, h3, p, ul, ol, blockquote, a, strong, hr) with the
editorial styles at reading width.

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
