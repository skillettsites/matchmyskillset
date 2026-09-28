# MatchMySkillset

Source for [matchmyskillset.com](https://matchmyskillset.com): a UK career-change tool. People
paste their CV (or type their job title), an AI model picks out their skills, and the site
suggests careers those skills transfer to, with live job listings and an optional one-off paid
report. There are no user accounts.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. Next 16 differs from older
  versions; read `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework code.
- Anthropic Claude for skills extraction, Stripe for payments, Resend for email.
- Supabase: tables prefixed `mms_` on a **shared** project used by other sites. Read
  `supabase/README.md` before touching the database.
- Job listings: Reed, Adzuna and Himalayas (Jooble only if `JOOBLE_API_KEY` is set).
- Hosted on Vercel. The Vercel project is not linked to Git, so pushing does not deploy.

## Local development

```bash
npm ci
npm run dev       # http://localhost:3000
npx tsc --noEmit  # type check
npm run lint      # ESLint (next build does not lint in Next 16)
npx next build
```

Environment variables go in `.env.local` (never committed). Read them through `env()` from
`src/lib/env.ts`, which strips the stray trailing `\n` and newlines some values carry.

## Useful files

- `src/lib/site.ts`: site name, contact email, legal entity and recruitment partner names.
- `src/lib/analytics.ts`: `track(event, params)` and the list of event names.
- `src/components/GoogleAnalytics.tsx`: Google Analytics with Consent Mode v2 and the cookie
  banner; also exports `VercelAnalytics` and `CookieSettingsButton`.
- `src/lib/rate-limit.ts`: `checkRateLimit()` backed by `mms_rate_limits` (fails open until
  migration 004 is applied).
- `supabase/`: migrations, rollback file and database notes.
