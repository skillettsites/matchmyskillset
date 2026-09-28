# Careers dataset: sources, method and refresh guide

This folder replaces the unsourced `src/data/occupations.ts` with pay figures taken
directly from ONS files and a curated list of career-changer destinations whose SOC
codes, apprenticeships, licences and named qualifications are all checked against a
source by `scripts/ashe/validate.mjs`.

Everything here is server-side data. `ashe-data.json` (about 480 KB) and
`soc2020.json` (about 300 KB) should not be imported into client components.

## Files

| File | What it is | Sourced or editorial |
|---|---|---|
| `ashe-data.json` | Every SOC 2020 unit group (412) plus the 139 higher-level groups and the UK "All employees" row, with ASHE gross annual pay for full-time and all employee jobs | Sourced (ONS), generated |
| `ashe.ts` | Typed loader: `SOURCE`, `getAsheUnitGroup`, `getAsheFigures`, `cvQuality`, `sourceLine` | Code |
| `soc2020.json`, `soc2020.ts` | Official unit group titles, ONS group descriptions, ONS "typical entry routes and associated qualifications" text, related job titles | Sourced (ONS), generated |
| `occupations.ts` | 141 curated destination occupations across 110 unit groups | Mixed: see its header |
| `licences.ts` | 17 licences, registrations and industry cards, each linked to the official body | Summaries editorial, pages checked |
| `index.ts` | `getCareerProfile(id)` joins an occupation with pay, ONS text, apprenticeships and licences | Code |
| `sources/apprenticeship-standards.json` | Snapshot of the 139 Skills England standards referenced | Sourced, generated |
| `sources/ncs-profiles.json` | Route facts extracted from 120 National Careers Service job profiles | Sourced, generated |
| `sources/ncs-job-profile-slugs.json` | All job profile slugs seen in the NCS sitemap | Sourced, generated |
| `sources/soc2020-index-evidence.json` | ONS coding index rows that place each curated job title in its unit group | Sourced, generated |
| `sources/licence-checks.json` | HTTP status and phrase checks for each licence body page | Generated |

The scripts that produce them live in `scripts/ashe/` (see "Refreshing" below). Raw
ONS files are committed in `scripts/ashe/raw/` with a `manifest.json` recording the
URL, SHA-256 and retrieval time of each.

## Sources and licences

All sources below state that their content is available under the
[Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
Pages that show the data must carry attribution: `SOURCE.attribution` for ONS pay,
`SOC_SOURCE.attribution` when quoting ONS SOC text, and the NCS attribution in
`sources/ncs-profiles.json` when quoting NCS text.

### ONS ASHE Table 14 (pay)

- Dataset: "Earnings and hours worked, occupation by four-digit SOC: ASHE Table 14",
  https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14
  (the URL still says "soc2010"; the 2025 files are coded to SOC 2020).
- Edition used: **2025 provisional**, the latest available on 28 September 2026.
  First published **23 October 2025** (also the release date of the ASHE 2025
  bulletin). ONS issued a **correction on 19 December 2025**: annual earnings for
  3312 Police officers (sergeant and below), and the groups 331 and 33 containing it,
  were suppressed for London, the South East, East and the UK after an error in the
  returns ONS received. The zip on the site is the corrected version (its files are
  dated 19 December 2025), and that is what was parsed.
- File: `ashetable142025provisional.zip` (SHA-256 `85888d69...c0d6d`, 11.2 MB, not
  committed). Two tables from it are committed (1.1 MB together):
  - **Table 14.7a** "Annual pay - Gross (£)": number of jobs (thousands), median,
    annual % change in median, mean, annual % change in mean, and the 10th, 20th,
    25th, 30th, 40th, 60th, 70th, 75th, 80th and 90th percentiles.
  - **Table 14.7b**, the coefficients of variation (CV) for the same cells.
- Sheets used: `Full-Time` (stored as `ft`) and `All` (all employee jobs, stored as `all`).
- Reference period: annual estimates are for the tax year ending 5 April of the
  reference year, so ASHE 2025 annual pay is for the tax year ending 5 April 2025, for
  employees on adult rates who had been in the same job for more than a year.

Print pay with `sourceLine()`, which returns
"Source: ONS ASHE 2025 (provisional), Table 14.7a, published 23 October 2025".

### ONS SOC 2020 Volume 1 (titles and ONS entry text)

https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume1structureanddescriptionsofunitgroups,
file `soc2020volume1structureanddescriptionofunitgroupsexcel20260827.xlsx`
(committed, 289 KB). Titles come from this file, which uses some newer wording than
the ASHE table (20 of 412 differ, for example 2232 "Registered community nurses"
where ASHE prints "Community nurses"); the ASHE wording is kept as `asheLabel`.

### ONS SOC 2020 Volume 2, the coding index (evidence for each SOC mapping)

https://www.ons.gov.uk/methodology/classificationsandstandards/standardoccupationalclassificationsoc/soc2020/soc2020volume2codingrulesandconventions,
"Version 14 Of The Standard Occupational Classification 2020 Index", 32,670 job
titles. ONS reissued the file as `soc2020volume2thecodingindexexcel20260827v2.xlsx` on
28 September 2026, the day this build was made; the evidence file was generated from
that v2 file. The 3.7 MB workbook is not committed; the rows used are kept in
`sources/soc2020-index-evidence.json`.

### Skills England apprenticeship standards

Public API https://skillsengland.education.gov.uk/api/apprenticeshipstandards (no key
needed; about 78 MB of JSON; 2,010 standards of which 712 were "Approved for
delivery" on 28 September 2026). Skills England replaced the Institute for
Apprenticeships and Technical Education on 1 June 2025, and the old
`instituteforapprenticeships.org/api/apprenticeshipstandards` URL now redirects to
the same API. `typicalDurationMonths` is the API's `typicalDuration` field, reported
as given (for example it gives 9 months for ST0490 Teacher - Postgraduate).

### National Careers Service job profiles

https://nationalcareers.service.gov.uk/job-profiles/{slug}. On 1 October 2026 the
service is renamed "Get careers information and advice" (stated on
https://nationalcareers.service.gov.uk/service-is-changing). The slugs are stored,
not full URLs, and `ncsProfileUrl()` builds the URL; if the domain or path changes,
update `NCS_PROFILE_BASE` in `index.ts` and `NCS_BASE` in `scripts/ashe/ncs.mjs`,
then re-run `fetch-references.mjs`, which records each profile's resolved URL. Two
quirks: a wrong slug returns HTTP 200 on a soft-404 page (`/explore-careers/alerts/404`),
so the script checks the final URL; and the sitemap returns a slightly different list
on each request (734, 736 and 737 profiles in three requests), so it takes the union
of three and a resolved profile page is the real check. NCS salary bands are not
stored: they show no source or date.

### Licence and registration bodies

Each entry in `licences.ts` points at the body's own page (GOV.UK, SIA, NMC, HCPC,
Social Work England, HSE for Gas Safe, SRA, ORR, CAA, CSCS, CISRS, NOCN for CPCS).
`fetch-references.mjs` checks each page loads and contains the listed phrases.

## Method

### Parsing ASHE

`scripts/ashe/build.mjs` reads the xlsx files with a small reader built on `jszip`
(already a dependency). It checks the header text of every column before reading,
matches rows between 14.7a and 14.7b by code and row number, and stores every value
exactly as ONS published it.

Cells without a figure are stored as `null`, never filled or estimated, and the ONS
marker is kept in `flags`:

| Marker | ONS meaning |
|---|---|
| `x` | CV above 20%: unreliable for practical purposes, suppressed |
| `..` | disclosive, suppressed |
| `:` | not applicable |
| `-` | nil or negligible |
| `.` | unavailable (CV table only) |
| `blank` | the cell is empty in the ONS table |

`cvQuality(cv)` applies the key printed on the ONS tables: up to 5% precise, up to
10% reasonably precise, up to 20% acceptable.

As a one-off cross-check during the build, every stored value (30,912 figures and
CVs) was compared with the same cells read by an independent parser (Python
openpyxl): 0 mismatches.

### How the curated list was made

1. **Destinations** follow the build order in the market research (teachers, police,
   nurses and NHS staff, military veterans, jobs without a degree, the highest-paid
   options and common destinations). `audiences` records which group each suits.
2. **SOC code.** Each job title was looked up in the ONS coding index and assigned
   the unit group ONS itself uses. `socIndexTitles` lists the exact index titles and
   `socExt` the extended sub-unit group. The mapping sometimes differs from intuition,
   and the ONS answer was kept: data analysts are 3544 (not 2135, which is cyber
   security), paralegals are 2419, clinical research associates are 2113, e-learning
   developers are 2134, fraud investigators, private investigators, security managers
   and Border Force officers are all 3319.
3. **Apprenticeships.** A standard is listed only if it is "Approved for delivery" and
   either the occupation's NCS profile names it (with the same level), or the standard
   lists the occupation title or an alias among its typical job titles, or the
   standard's title is the occupation title. Of 156 links, 132 are named on the NCS
   profile, 22 come from typical job titles and 2 from an identical title.
4. **Licences.** Listed only when the NCS profile mentions it (25 links), the ONS SOC
   entry text mentions it (1: the CAA licence for air traffic controllers), or the
   licence body's own page names the profession (2: HCPC for practitioner
   psychologists, ORR for train drivers). Scope is stated where narrower than the UK
   (QTS England; Social Work England; SQE England and Wales).
5. **Named qualifications** (for example CIPD, AAT, NEBOSH, PGCE, PQiP) are listed
   only if they appear on the occupation's NCS profile.
6. **Editorial fields**, labelled as such in `occupations.ts`: display titles,
   aliases, descriptions (written in our own words, not copied from ONS or NCS),
   skills and importance (1 to 5, mapped to `src/data/skills-taxonomy.ts`),
   `degreeUsuallyRequired`, `audiences` and `payNote`. `degreeUsuallyRequired` answers
   "is a degree normally needed to get in?": it is false wherever ONS or NCS documents
   a route below degree level (a level 2 to 5 apprenticeship, an HND or college course,
   or working up from a junior role), and true only where a degree or degree
   apprenticeship is the normal way in. It is not a statement about how many people
   in the job hold degrees (ONS says, for example, that most data analysts do).

### Taxonomy fixes

`src/data/skills-taxonomy.ts`: s056 is now "Professional Networking" and s220
"Computer Networking" (both were "Networking"); ids are unchanged. s023 Statistical
Analysis pointed at s120, which does not exist; it now points at s114 Data Science,
which already lists s023 as related.

## Using it

```ts
import { getCareerProfile, sourceLine, cvQuality } from "@/data/careers";

const p = getCareerProfile("data-analyst");
p.pay.ft.median;          // 38572, ONS full-time median, SOC 3544
p.pay.ft.p25;             // 30835
cvQuality(p.pay.ft.cv.median);
p.payScope;               // says the figure covers the whole unit group
p.sourceLine;             // "Source: ONS ASHE 2025 (provisional), Table 14.7a, published 23 October 2025"
```

Always show `payScope` (and `payNote` when present) next to a figure, and handle
`null` by saying ONS did not publish a reliable figure, never by substituting one.

## Refreshing

### ASHE 2026 (ONS release scheduled for 22 October 2026, 9:30am)

1. In `scripts/ashe/config.mjs` set `ASHE_YEAR = 2026` (edition stays
   `"provisional"`) and add an `EDITIONS["2026-provisional"]` entry with the release
   date shown on the ONS dataset page.
2. `node scripts/ashe/build.mjs` downloads the new zip (it finds the link on the
   dataset page), commits the two tables to `scripts/ashe/raw/2026-provisional/`,
   and regenerates `ashe-data.json` and `soc2020.json`.
3. `node scripts/ashe/validate.mjs --download` (checks the committed files are
   identical to the live ONS zip, then spot-checks random cells).
4. Review the build summary for changes in suppressed cells; `payNote` text that
   says a median is suppressed is checked against the data by the validator.

The same release carries **2025 revised** figures, including the review of the
suppressed police data. To use those, set `ASHE_YEAR = 2025` and
`ASHE_EDITION = "revised"` and add the matching `EDITIONS` entry.

If ONS changes the file names inside the zip, update the `TABLES` patterns in
`config.mjs`; if it changes the column layout, the header check in `build.mjs` stops
the build.

### The other sources

`node scripts/ashe/fetch-references.mjs` refreshes everything in `sources/` from the
current `occupations.ts` (large downloads are cached in `scripts/ashe/.cache`, which
is git-ignored). Run it after editing `occupations.ts`, then run the validator.

### Validation

`node scripts/ashe/validate.mjs` checks: committed raw file hashes; at least 15 random
cells (40 by default, plus fixed checks) read by cell reference from the ONS workbooks
against the JSON; that all 412 codes match SOC 2020 Volume 1; that every null has an
ONS marker; for every curated occupation, the SOC code exists in ASHE and SOC 2020,
the coding index places each `socIndexTitles` entry in that code, every skill id
exists, every apprenticeship, licence and qualification has evidence, and every NCS
profile resolved; that the taxonomy has no duplicate names or broken references; and
that no added file contains an em dash. `--seed=N` repeats a sample, `--download`
re-fetches the ONS zip.

## Known limitations

- **Suppressed cells.** ONS publishes a full-time median for 382 of the 412 unit
  groups and an all-employee median for 363. Missing examples among the curated list:
  3312 police officers (2025 correction), 2462 probation officers, 2226 other
  psychologists (educational psychologists), 8215 driving instructors. Percentiles
  are suppressed far more often than medians: of the 412 full-time rows, the median
  is missing in 30, the 25th percentile in 93, the 75th in 189, the 10th in 192 and
  the 90th in 377. Show a range only when both ends were published.
- **Full-time versus all employees.** `ft` is full-time jobs only; `all` includes
  part-time jobs and is much lower for occupations with a lot of part-time work.
  Career pages should normally quote `ft`.
- **Unit group, not job title.** ASHE is published at 4-digit SOC. A figure describes
  every job ONS codes to that group: 24 unit groups are shared by more than one
  curated occupation, and some destinations sit in broad "n.e.c." groups (for example
  clinical coders in 3549, policy officers in 2439). `payScope` and `payNote` exist
  for this reason.
- **Regional pay.** Table 14 is UK-wide only. ONS does publish region by 4-digit SOC
  in "ASHE Table 15" (dataset `regionbyoccupation4digitsoc2010ashetable15`), but it
  is not used here, and it is sparse: in the 2025 provisional Table 15 (4).7a,
  full-time medians are published for 2,627 of the 4,532 region and unit group cells
  in the 11 regions and nations found when checked (from 176 of 412 in the North East
  to 276 in the North West). Adding it would be a separate step.
- **Coverage.** ASHE covers employee jobs only, not the self-employed, so it says
  nothing about earnings in any occupation where people work for themselves. Annual
  pay covers only people in the same job for more than a year. Job counts are
  indicative, as ONS warns.
- **Provisional figures** will be revised; ONS says the revised 2025 dataset will be
  released in October or November 2026.
- **Not mapped.** "Instructional designer" and "medical science liaison" do not appear
  in the ONS coding index, so they are not given a SOC code (the nearest index
  entries used are "E-learning developer" in 2134 and "Medical liaison officer" in
  3552). Learning technologists are coded by ONS to 3132 IT user support
  technicians and are not included.
- **Apprenticeship standards come from the Skills England catalogue**, which serves
  England. The dataset says nothing about apprenticeship routes in Scotland, Wales or
  Northern Ireland, and pages aimed at those nations should not imply otherwise.
- **NCS rename** on 1 October 2026 may change URLs; re-run `fetch-references.mjs`.
- **Editorial fields** (skills, importance, degree flag, descriptions, audiences) are
  judgement, not data, and must not be presented as sourced.
