@AGENTS.md

# MatchMySkillset (matchmyskillset.com)

Two-sided UK job board, a joint venture with Flintstone Associates (Freddie, recruitment partner; our design).
Job seekers upload a CV and get LIVE jobs scored against their skills; employers post jobs (paid plans), get
applicants and search opted-in candidates. Front-facing focus: engineering, manufacturing and Industry 4.0, but
every other job still works for people who arrive from Google. v3 launched 28 Sep 2026; v4 (CV tools, Plus,
application tracker, Lite plan, partner rates, engineering niche) 29 Sep 2026.
Full owner guide (how it works, data, jobs, revenue, operations):
https://claude.ai/code/artifact/da344389-e483-4509-9a41-fbe1085ab402

## Deploy
- Vercel project `matchmyskillset`, team `skillettsites-projects`. NOT git-linked: a push does not deploy.
- Merge to `master`, push, then from a clean checkout: `npx vercel --prod --yes --scope skillettsites-projects` (run it once; the output ends in a JSON block, which is success).
- Commit as `git -c user.name=skillettsites -c user.email=davidskillett@hotmail.co.uk commit`.
- Env vars: `printf '%s' "<value>" | npx vercel env add NAME production --scope skillettsites-projects` (no trailing newline). Read env in code via `env()` from `src/lib/env.ts`.
- Crons (vercel.json): `/api/cron/job-alerts` 07:00 UTC daily + Mondays, `/api/cron/tracker-checkins` 08:30 UTC daily (both need `CRON_SECRET`).
- Optional env: `TRACKER_SECRET` (set in prod), `PACK_DAILY_CAP` (300), `FREE_PACK_DAILY_CAP` (100), `TRACKER_CHECKINS_PER_RUN` (100, max 300).
- Local QA with `next start`: `isAllowedOrigin` rejects localhost in production mode, so scripts send `Origin: https://matchmyskillset.com`; in-page POSTs (e.g. job pack generation) 403 locally but work live.

## Design
WebBuildYourIdeas design system (`src/app/globals.css`: `.btn-primary`, `.display-hero`, `.gradient-text`, `.card-white`, `.field`, `.hero-glow`...). Custom classes live in `@layer components`. Marketing kit in `src/components/marketing/`.

## Job seekers
- CV card `src/components/cv/CvUploadCard.tsx` -> `/api/parse-cv` (unpdf) + `/api/assess` (Claude `claude-sonnet-5` structured extraction; job-title path has no AI) -> `/results/[token]` (mms_reports, 12 months).
- Job matching `src/lib/apis/jobs/fit.ts` + `match.ts`: sources registry `src/lib/apis/jobs/sources.ts` (Reed + full text via job details, Adzuna, GOV.UK Teaching Vacancies, Himalayas, Remotive, `mms` posted jobs first; Jooble/Careerjet switch on by env key). Score = skills 60% (advert skills full, typical-role skills half, rarity-weighted) + role 25% + level 15%, with honest caps ("Title match only" <= 55). Off-target families and US-licence jobs dropped. False friends in `src/lib/skills/role-families.ts` (AI, workflow, n8n, RPA, business "automation" = IT, not factory automation). `dedupe()` in match.ts keeps one advert per title, employer and region (closest copy; agencies post one job under several towns), except our own posted jobs. Snapshot in `mms_reports.matches.jobs`, 12 h.
- Engineering niche pages: `/engineering-and-manufacturing-jobs` (nav "Careers"), `/robotics-and-automation-jobs`, `/3d-printing-jobs`, `/graduate-engineering-jobs`, `/jobs-for-ex-military`; job search suggestions are engineering titles. The older career-changer pages stay live under "Other careers".
- Job pages `/jobs/[id]` for adverts from other boards (id = listing id, e.g. `reed_57381080`), opened from "View job" / the title on every job card: pay, contract, dates, the advert as plain blocks (never the board's HTML) and, with `?r=<results token>`, the person's match. `src/lib/apis/jobs/job-page.ts`: Reed and Teaching Vacancies are read live by id (whole advert, 6 h cache); the rest come from `mms_job_listings` (migration 011), written by `/api/jobs/search` and the results matcher (`after()`), cleaned after 14 days by the job-alerts cron. Himalayas has no single-job API, so its whole advert is kept at search time; Adzuna only ever sends ~500 characters and Remotive none, and the page says so. Noindex (Himalayas terms: no passing its jobs to search engines). Adzuna terms: every advert shows "Jobs by Adzuna" at least 116x23 px (`SourceBadge`). The old `/jobs/:id` redirect in next.config.ts now only catches non-board ids (the removed `featured_` pages). Results keep their tab, filters, page and scroll when you come back from a job page (sessionStorage).
- Apply with MatchMySkillset (`/jobs/mms/[id]`, JobPosting JSON-LD), job alerts (`/alerts/[token]`), opt-in profile (`/me/[token]`), contact requests (`/contact/[token]`).
- Careers tab: ONS data `src/data/careers/` (ASHE 2025; refresh `scripts/ashe/` when ASHE 2026 lands 22 Oct 2026), deterministic career scoring `src/lib/skills/scoring.ts`, £9.99 report.

## Employers
- `/employers`, `/employers/pricing`, magic-link auth (`mms_login_tokens`, `mms_employer_sessions`, cookie `mms_employer`), `/employers/dashboard/**`, `/companies/[slug]`, `/admin` (ADMIN_SECRET; approve jobs, comp plans, partner rates, placements, read-only shortlist list).
- Plans (`src/lib/employer/plans.ts`): Lite £49/mo (1 live job, applicants inbox only: no matched candidates, candidate search, contact requests, shortlist, skills-gap or company page; `hasCandidateSearch()`), Starter £199/mo (3 live jobs, 10 matches/role, no shortlist), Growth £499/mo (10 jobs, 30 matches/role, recruiter shortlist, skills-gap, company page), Enterprise £999+ by contact (the ONLY plan with "unlimited": listings and matches, plus shortlist), pay per hire by contact. No "popular" badge (no sales yet; a highlight must be factual). Stripe subscriptions via `/api/employers/checkout` + `/api/stripe/webhook` branches. `isStripeReady()` hides pay buttons while the key is invalid.
- Recruiter shortlists (`src/lib/employer/shortlists.ts`, migration 008): "Send me a recruiter shortlist" box on the job form (Growth/Enterprise, ticked) sets `mms_jobs.shortlist_wanted`; the `mms_shortlists` request opens when admin approves the job (or from the job page later), Telegram to Dave. Recruiters (Fred) work at `/recruiter` (RECRUITER_SECRET, separate from ADMIN_SECRET, cookie `mms_recruiter` scoped to /recruiter): applicants in full + opted-in matches (same ranking as matched candidates), pick/order/note, save, send (emails the employer). Employer sees `/employers/dashboard/jobs/[id]/shortlist`: applicants in full, non-applicants anonymous with Request contact. Notes/summary have emails, phones, links and the candidate's first name stripped. No turnaround or shortlist size is promised anywhere until Dave decides.
- `src/lib/employer/notify.ts` emails employers; Telegram alerts via `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`.
- Partner rates (Flintstone Associates clients, migration 010): no public price, pricing pages say "Flintstone Associates clients: ask about partner rates." Admin sets the plan and a monthly price in pounds per account (`src/components/admin/PartnerRateForm.tsx`, stored as `partner_plan` + `partner_price_pence`); checkout charges it (`monthlyPriceFor`), webhook stores `billed_price_pence`, billing page shows "Partner rate".

## Journey tracking (migration 010, `src/lib/tracking/`)
- Applicant statuses: new | viewed | shortlisted | interview | offer | hired | rejected. Every change logged to `mms_journey_events` (no names/emails, keyed email hash); `kind='stage'` rows = first time an application reaches applied/interview/offer/placed (funnel counts these).
- Application tracker `mms_tracked_applications`: MMS applies (auto, notice on the apply form) + outside jobs via "Did you apply?" on job cards (`TrackApplied.tsx`, `/api/tracker`). Private page `/tracker/[token]`. Free for everyone, not part of Plus. Accounts: `src/lib/tracking/identity.ts` links new rows to the signed-in job seeker; sign-in claims guest rows with the same email (`claimTrackedForAccount`); `/account` lists them ("Your applications"); unticking "Track my applications" stops every check-in; account delete removes the rows; the export includes them.
- Check-ins: `/api/cron/tracker-checkins` 08:30 UTC daily (CRON_SECRET) emails at 7 and 21 days; signed links (`TRACKER_SECRET`) open `/checkin` (GET confirms, POST records); List-Unsubscribe one-click at `/api/tracker/unsubscribe`. Employer sees "Candidate says: interview/offer/placed" only.
- Placements `mms_placements`: employer hired, candidate "placed", or admin. Case-study consent asked by email ~24 h later (`/placement/[token]`, unticked box, time + wording stored).
- Admin: `/admin/funnel` (totals, trends, conversions, filters by date/field/client, placements list, CSV exports at `/admin/funnel/export`). Retention: tracked 12 months, events 24 months, placements 6 years (email cleared at 12 months).

## Candidate CV tools (job packs, Plus, accounts)
- Owner decisions (29 Sep 2026): free forever = CV upload + scored live jobs, alerts, applying, careers, and ONE free tailored CV per person (account needed); job pack £2.99 one-off (tailored CV + cover letter + interview prep); Plus £7/month, up to 30 packs a billing month (fair use) and Check any job. The application tracker is free for everyone. Constants in `src/lib/candidate/plans.ts`.
- Accounts: magic link like the employer side (`src/lib/candidate/session.ts`, cookie `mms_candidate`, hashed tokens/sessions), `/account` (packs, plan, billing portal, saved CV, consents, export, delete). `hasPlus(accountId)` / `hasPlusForEmail()` in `src/lib/candidate/entitlements.ts` for other features.
- Packs: `/tools/tailor` (from a results job card, `/jobs/mms/[id]`, or a pasted advert) -> `POST /api/packs` -> free/Plus write straight away, card goes to Stripe -> `/packs/[token]` claims and writes (`/api/packs/[token]/generate`, one writer wins) -> review/edit/approve -> Word (`/api/packs/[token]/docx`, built with jszip) and PDF (`/packs/[token]/print`). Two Claude calls (`src/lib/candidate/pack-ai.ts`, claude-sonnet-5, structured output, cached system prompt): CV + gaps, and letter + prep. `grounding.ts` then removes any employer, date, qualification, skill or figure not in the CV and lists what it removed. The prompt also bans status words the CV does not state (time-served, chartered, security cleared...).
- Stripe: `src/lib/candidate/billing-webhook.ts`, called from `/api/stripe/webhook` BEFORE the employer handler (metadata product `mms_job_pack` / `mms_plus`). `isStripeReady()` gates pay buttons; the free CV works without Stripe.
- Tables: migration 009 (`mms_candidate_*`, `mms_job_packs`, `mms_purchases.product`, `mms_candidate_claim_usage()`). Everything says "not switched on yet" before it is applied. Caps: `PACK_DAILY_CAP` (300), `FREE_PACK_DAILY_CAP` (100).

## Data
Supabase shared project `noxczmrnyyosgvvjlqca`; tables `mms_*`, service role only. Migrations 003-007 applied 28 Sep 2026 (never re-run 001/002); 008_shortlists, 009_candidate_tools, 010_tracking and 011_job_listings applied 29 Sep 2026 and tested end to end. Test data: @example.com or delivered+...@resend.dev (the tracker flags these `is_test`) and source 'qa-test', delete after (including `mms_journey_events where is_test`).

## Rules
- No em dashes. UK English. No invented statistics, jobs, candidates, testimonials or ratings; every figure sourced.
- CV text shared with an employer only when the candidate applies (consent naming the company) or accepts a contact request.
- Leave AI-risk topics, job-to-job comparison pages and "career change at 40" to the sibling site AICareerSwap.
