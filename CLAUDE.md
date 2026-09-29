@AGENTS.md

# MatchMySkillset (matchmyskillset.com)

Two-sided UK job board. Job seekers upload a CV and get LIVE jobs scored against their skills; employers post
jobs (paid plans), get applicants and search opted-in candidates. v3 launched 28 Sep 2026.
Full owner guide (how it works, data, jobs, revenue, operations):
https://claude.ai/code/artifact/da344389-e483-4509-9a41-fbe1085ab402

## Deploy
- Vercel project `matchmyskillset`, team `skillettsites-projects`. NOT git-linked: a push does not deploy.
- Merge to `master`, push, then from a clean checkout: `npx vercel --prod --yes --scope skillettsites-projects`.
- Commit as `git -c user.name=skillettsites -c user.email=davidskillett@hotmail.co.uk commit`.
- Env vars: `printf '%s' "<value>" | npx vercel env add NAME production --scope skillettsites-projects` (no trailing newline). Read env in code via `env()` from `src/lib/env.ts`.
- Crons (vercel.json): `/api/cron/job-alerts` 07:00 UTC daily + Mondays, `/api/cron/tracker-checkins` 08:30 UTC daily (both need `CRON_SECRET`).

## Design
WebBuildYourIdeas design system (`src/app/globals.css`: `.btn-primary`, `.display-hero`, `.gradient-text`, `.card-white`, `.field`, `.hero-glow`...). Custom classes live in `@layer components`. Marketing kit in `src/components/marketing/`.

## Job seekers
- CV card `src/components/cv/CvUploadCard.tsx` -> `/api/parse-cv` (unpdf) + `/api/assess` (Claude `claude-sonnet-5` structured extraction; job-title path has no AI) -> `/results/[token]` (mms_reports, 12 months).
- Job matching `src/lib/apis/jobs/fit.ts` + `match.ts`: sources registry `src/lib/apis/jobs/sources.ts` (Reed + full text via job details, Adzuna, GOV.UK Teaching Vacancies, Himalayas, Remotive, `mms` posted jobs first; Jooble/Careerjet switch on by env key). Score = skills 60% (advert skills full, typical-role skills half, rarity-weighted) + role 25% + level 15%, with honest caps ("Title match only" <= 55). Off-target families and US-licence jobs dropped. Snapshot in `mms_reports.matches.jobs`, 12 h.
- Apply with MatchMySkillset (`/jobs/mms/[id]`, JobPosting JSON-LD), job alerts (`/alerts/[token]`), opt-in profile (`/me/[token]`), contact requests (`/contact/[token]`).
- Careers tab: ONS data `src/data/careers/` (ASHE 2025; refresh `scripts/ashe/` when ASHE 2026 lands 22 Oct 2026), deterministic career scoring `src/lib/skills/scoring.ts`, £9.99 report.

## Employers
- `/employers`, `/employers/pricing`, magic-link auth (`mms_login_tokens`, `mms_employer_sessions`, cookie `mms_employer`), `/employers/dashboard/**`, `/companies/[slug]`, `/admin` (ADMIN_SECRET; approve jobs, comp plans, read-only shortlist list).
- Plans (`src/lib/employer/plans.ts`): Lite £49/mo (1 live job, applicants inbox only: no matched candidates, candidate search, contact requests, shortlist, skills-gap or company page; `hasCandidateSearch()`), Starter £199/mo (3 live jobs, 10 matches/role, no shortlist), Growth £499/mo (10 jobs, 30 matches/role, recruiter shortlist, skills-gap, company page), Enterprise £999+ by contact (the ONLY plan with "unlimited": listings and matches, plus shortlist), pay per hire by contact. No "popular" badge (no sales yet; a highlight must be factual). Stripe subscriptions via `/api/employers/checkout` + `/api/stripe/webhook` branches. `isStripeReady()` hides pay buttons while the key is invalid.
- Recruiter shortlists (`src/lib/employer/shortlists.ts`, migration 008): "Send me a recruiter shortlist" box on the job form (Growth/Enterprise, ticked) sets `mms_jobs.shortlist_wanted`; the `mms_shortlists` request opens when admin approves the job (or from the job page later), Telegram to Dave. Recruiters (Fred) work at `/recruiter` (RECRUITER_SECRET, separate from ADMIN_SECRET, cookie `mms_recruiter` scoped to /recruiter): applicants in full + opted-in matches (same ranking as matched candidates), pick/order/note, save, send (emails the employer). Employer sees `/employers/dashboard/jobs/[id]/shortlist`: applicants in full, non-applicants anonymous with Request contact. Notes/summary have emails, phones, links and the candidate's first name stripped. No turnaround or shortlist size is promised anywhere until Dave decides.
- `src/lib/employer/notify.ts` emails employers; Telegram alerts via `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`.
- Partner rates (Flintstone Associates clients, migration 010): no public price, pricing pages say "Flintstone Associates clients: ask about partner rates." Admin sets `partner_plan` + `partner_price_pence` per account (`src/components/admin/PartnerRateForm.tsx`); checkout charges it (`monthlyPriceFor`), webhook stores `billed_price_pence`, billing page shows "Partner rate".

## Journey tracking (migration 010, `src/lib/tracking/`)
- Applicant statuses: new | viewed | shortlisted | interview | offer | hired | rejected. Every change logged to `mms_journey_events` (no names/emails, keyed email hash); `kind='stage'` rows = first time an application reaches applied/interview/offer/placed (funnel counts these).
- Application tracker `mms_tracked_applications`: MMS applies (auto, notice on the apply form) + outside jobs via "Did you apply?" on job cards (`TrackApplied.tsx`, `/api/tracker`). Private page `/tracker/[token]`. Account integration point: `src/lib/tracking/identity.ts`.
- Check-ins: `/api/cron/tracker-checkins` 08:30 UTC daily (CRON_SECRET) emails at 7 and 21 days; signed links (`TRACKER_SECRET`) open `/checkin` (GET confirms, POST records); List-Unsubscribe one-click at `/api/tracker/unsubscribe`. Employer sees "Candidate says: interview/offer/placed" only.
- Placements `mms_placements`: employer hired, candidate "placed", or admin. Case-study consent asked by email ~24 h later (`/placement/[token]`, unticked box, time + wording stored).
- Admin: `/admin/funnel` (totals, trends, conversions, filters by date/field/client, placements list, CSV exports at `/admin/funnel/export`). Retention: tracked 12 months, events 24 months, placements 6 years (email cleared at 12 months).

## Candidate CV tools (job packs, Plus, accounts)
- Owner decisions (29 Sep 2026): free forever = CV upload + scored live jobs, alerts, applying, careers, and ONE free tailored CV per person (account needed); job pack £2.99 one-off (tailored CV + cover letter + interview prep); Plus £7/month, up to 30 packs a billing month (fair use), Check any job, full tracker access. Constants in `src/lib/candidate/plans.ts`.
- Accounts: magic link like the employer side (`src/lib/candidate/session.ts`, cookie `mms_candidate`, hashed tokens/sessions), `/account` (packs, plan, billing portal, saved CV, consents, export, delete). `hasPlus(accountId)` / `hasPlusForEmail()` in `src/lib/candidate/entitlements.ts` for other features.
- Packs: `/tools/tailor` (from a results job card, `/jobs/mms/[id]`, or a pasted advert) -> `POST /api/packs` -> free/Plus write straight away, card goes to Stripe -> `/packs/[token]` claims and writes (`/api/packs/[token]/generate`, one writer wins) -> review/edit/approve -> Word (`/api/packs/[token]/docx`, built with jszip) and PDF (`/packs/[token]/print`). Two Claude calls (`src/lib/candidate/pack-ai.ts`, claude-sonnet-5, structured output, cached system prompt): CV + gaps, and letter + prep. `grounding.ts` then removes any employer, date, qualification, skill or figure not in the CV and lists what it removed.
- Stripe: `src/lib/candidate/billing-webhook.ts`, called from `/api/stripe/webhook` BEFORE the employer handler (metadata product `mms_job_pack` / `mms_plus`). `isStripeReady()` gates pay buttons; the free CV works without Stripe.
- Tables: migration 009 (`mms_candidate_*`, `mms_job_packs`, `mms_purchases.product`, `mms_candidate_claim_usage()`). Everything says "not switched on yet" before it is applied. Caps: `PACK_DAILY_CAP` (300), `FREE_PACK_DAILY_CAP` (100).

## Data
Supabase shared project `noxczmrnyyosgvvjlqca`; tables `mms_*`, service role only, migrations 003-007 applied 28 Sep 2026 (never re-run 001/002); 008_shortlists.sql (mms_shortlists, mms_shortlist_items, mms_jobs.shortlist_wanted) applied 29 Sep 2026 and tested end to end. Test data: @example.com or delivered+...@resend.dev and source 'qa-test', delete after.

## Rules
- No em dashes. UK English. No invented statistics, jobs, candidates, testimonials or ratings; every figure sourced.
- CV text shared with an employer only when the candidate applies (consent naming the company) or accepts a contact request.
- Leave AI-risk topics, job-to-job comparison pages and "career change at 40" to the sibling site AICareerSwap.
