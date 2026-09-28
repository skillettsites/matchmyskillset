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
- Crons (vercel.json): `/api/cron/job-alerts` 07:00 UTC daily + Mondays (needs `CRON_SECRET`).

## Design
WebBuildYourIdeas design system (`src/app/globals.css`: `.btn-primary`, `.display-hero`, `.gradient-text`, `.card-white`, `.field`, `.hero-glow`...). Custom classes live in `@layer components`. Marketing kit in `src/components/marketing/`.

## Job seekers
- CV card `src/components/cv/CvUploadCard.tsx` -> `/api/parse-cv` (unpdf) + `/api/assess` (Claude `claude-sonnet-5` structured extraction; job-title path has no AI) -> `/results/[token]` (mms_reports, 12 months).
- Job matching `src/lib/apis/jobs/fit.ts` + `match.ts`: sources registry `src/lib/apis/jobs/sources.ts` (Reed + full text via job details, Adzuna, GOV.UK Teaching Vacancies, Himalayas, Remotive, `mms` posted jobs first; Jooble/Careerjet switch on by env key). Score = skills 60% (advert skills full, typical-role skills half, rarity-weighted) + role 25% + level 15%, with honest caps ("Title match only" <= 55). Off-target families and US-licence jobs dropped. Snapshot in `mms_reports.matches.jobs`, 12 h.
- Apply with MatchMySkillset (`/jobs/mms/[id]`, JobPosting JSON-LD), job alerts (`/alerts/[token]`), opt-in profile (`/me/[token]`), contact requests (`/contact/[token]`).
- Careers tab: ONS data `src/data/careers/` (ASHE 2025; refresh `scripts/ashe/` when ASHE 2026 lands 22 Oct 2026), deterministic career scoring `src/lib/skills/scoring.ts`, £9.99 report.

## Employers
- `/employers`, `/employers/pricing`, magic-link auth (`mms_login_tokens`, `mms_employer_sessions`, cookie `mms_employer`), `/employers/dashboard/**`, `/companies/[slug]`, `/admin` (ADMIN_SECRET; approve jobs, comp plans).
- Plans: Starter £199/mo (3 live jobs, 10 matches/role), Growth £499/mo (10 jobs, unlimited, skills-gap, company page), Enterprise/pay-per-hire by contact. Stripe subscriptions via `/api/employers/checkout` + `/api/stripe/webhook` branches. `isStripeReady()` hides pay buttons while the key is invalid.
- `src/lib/employer/notify.ts` emails employers; Telegram alerts via `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`.

## Data
Supabase shared project `noxczmrnyyosgvvjlqca`; tables `mms_*`, service role only, migrations 003-007 applied 28 Sep 2026 (never re-run 001/002). Test data: @example.com or delivered+...@resend.dev and source 'qa-test', delete after.

## Rules
- No em dashes. UK English. No invented statistics, jobs, candidates, testimonials or ratings; every figure sourced.
- CV text shared with an employer only when the candidate applies (consent naming the company) or accepts a contact request.
- Leave AI-risk topics, job-to-job comparison pages and "career change at 40" to the sibling site AICareerSwap.
