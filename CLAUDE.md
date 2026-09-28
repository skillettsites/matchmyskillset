@AGENTS.md

# MatchMySkillset (matchmyskillset.com)

UK guide for people leaving a job: where people like them go, ONS pay, how to get there.
Rebuilt 28 Sep 2026. Full owner guide (how it works, data, jobs, revenue, operations):
https://claude.ai/code/artifact/da344389-e483-4509-9a41-fbe1085ab402

## Deploy
- Vercel project `matchmyskillset`, team `skillettsites-projects`. NOT git-linked: a push does not deploy.
- Merge to `master`, push, then from a clean checkout: `npx vercel --prod --yes --scope skillettsites-projects`.
- Commit as `git -c user.name=skillettsites -c user.email=davidskillett@hotmail.co.uk commit`.
- Add env vars with `printf '%s' "<value>" | npx vercel env add NAME production --scope skillettsites-projects` (no trailing newline). Read env in code via `env()` from `src/lib/env.ts`.

## Architecture
- Data: `src/data/careers/` = ONS ASHE 2025 Table 14 (all 412 SOC 2020 codes) + 141 curated destination occupations, Skills England standards, NCS profiles, licences. Build/validate with `scripts/ashe/` (set the year in `config.mjs`; ASHE 2026 due 22 Oct 2026). Never print a salary that is not from this dataset or a linked primary source.
- Analysis: `/discover` (job picker = no AI; CV = Claude `claude-sonnet-5` structured extraction in `src/lib/apis/claude.ts`), deterministic scoring in `src/lib/skills/scoring.ts` (`skills-overlap-v2`, keep `METHOD_SUMMARY` honest), results at `/results/[token]` (`mms_reports`, 12 months).
- Paid report: £9.99 one-off, Stripe guest checkout (`/api/checkout`), webhook `/api/stripe/webhook` (`mms_stripe_events`, `mms_purchases`), page `/report/[token]`.
- Jobs: registry in `src/lib/apis/jobs/sources.ts` (Reed, Adzuna, Teaching Vacancies, Himalayas, Remotive live; Jooble + Careerjet switch on by env key). No indexable per-job pages.
- Content: profession hubs (`/career-change-from-teaching`, `/non-clinical-jobs-for-nurses`, `/jobs-for-ex-police-officers`, `/jobs-for-ex-military`, `/career-change-from-retail`, `/careers-for`), guides, pay pages. Redirects live in `src/data/redirects/{pages,hubs}.json` (build fails on duplicates). Titles max 60 chars via `guideMetadata()`.
- Supabase: shared project `noxczmrnyyosgvvjlqca`; MMS tables are `mms_*`, service role only. Migrations 003-005 applied 28 Sep 2026; never re-run 001/002 (see `supabase/README.md`).

## Rules
- No em dashes. UK English. No invented statistics, testimonials, ratings or match claims; every figure sourced.
- Leave AI-risk topics, job-to-job comparison pages and "career change at 40" to the sibling site AICareerSwap.
- Recruiter sharing (Fred) stays off until `RECRUITMENT_PARTNER_NAME` in `src/lib/site.ts` names the agency's legal entity.
- Raw CV text is never stored unless the person ticks the recruiter box.
