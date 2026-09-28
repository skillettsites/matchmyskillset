# MatchMySkillset database notes

MatchMySkillset (MMS) does **not** have its own Supabase project. Its tables live on the
**shared** project `noxczmrnyyosgvvjlqca` (region eu-west-1), alongside about 90 tables
that belong to other sites, including CarCostCheck's revenue data. Every MMS object is
prefixed `mms_`. Treat every change here as a change to production for all of those sites.

## Rules

- Never run a migration against the shared project without the owner's approval.
- Never `DROP` or `TRUNCATE` without asking. Use `CREATE ... IF NOT EXISTS`.
- MMS reads and writes its tables only from server routes, through the service-role
  client in `src/lib/supabase/admin.ts`. After 003 and 004 the anon and authenticated
  roles have no privileges and no policies on any `mms_` table.
- MMS has no accounts and no longer uses Supabase Auth. Nothing in MMS should read or
  write `auth.users` or `app_metadata`.

## 001_initial_schema.sql must NEVER be re-run

`migrations/001_initial_schema.sql` does not match the live database and is kept only as
history.

- Its `mms_assessments_select_own` policy allows `auth.uid() IS NULL AND user_id IS NULL`.
  The app never set `user_id`, so re-running it would let **anyone with the public anon
  key read every stored CV**.
- It recreates the `on_auth_user_created_mms` trigger on the shared `auth.users` table,
  which 003 removes.
- Its other policies differ from what is live (live used `anon_insert`, `anon_select`
  and `service_role_all`; see the rollback file).
- `002_add_cv_to_leads.sql` added `cv_text` to `mms_email_leads` "so Fred can browse
  candidates". The revamp removes that use. Its `mms_email_leads_updated_at` trigger was
  never created live. Do not re-run 002 either.

## Migration status

| File | What it does | Status (28 Sep 2026) |
|---|---|---|
| `001_initial_schema.sql` | Original schema. Does not match live. | History only. Never re-run. |
| `002_add_cv_to_leads.sql` | Added CV text to leads. | History only. Never re-run. |
| `003_revamp_cleanup.sql` | Removes the MMS trigger on `auth.users` and its function; drops the anon policies on `mms_employers`, `mms_featured_jobs`, `mms_email_leads`, `mms_job_clicks`, `mms_search_logs`; revokes anon/authenticated privileges on every `mms_` table; keeps RLS on. | Written, **not applied**. Needs owner approval. |
| `004_revamp_tables.sql` | Creates `mms_reports`, `mms_purchases`, `mms_stripe_events`, `mms_rate_limits` and `mms_rate_limit_hit()`. RLS on, no policies, service role only. | Written, **not applied**. Needs owner approval. |
| `rollback/2026-09-28-before.sql` | Live definitions captured before 003/004 (trigger, function, 12 policies, grants). Restores the old state if 003 has to be undone. | Reference. |

Apply 003 then 004, each as one transaction (both files contain `BEGIN`/`COMMIT`), with
the Supabase SQL editor or the Management API. Each file ends with read-only checks.

### About removing the auth.users trigger

`auth.users` is owned by `supabase_auth_admin`, and `postgres` is not a member of that
role, so `DROP TRIGGER ... ON auth.users` may be refused. 003 handles this: it confirms
the trigger is the only thing depending on `handle_mms_new_user()`, tries `DROP TRIGGER`,
then drops the function with `CASCADE` (which removes the trigger with it). If that is
refused too, it turns the function into a no-op and raises a WARNING, and the trigger
then has to be removed from the dashboard or by Supabase support. The other two triggers
on `auth.users` (`on_auth_user_created`, `on_auth_user_created_notify`) belong to other
sites and are never touched.

## Tables after the revamp

### New (004)

| Table | Columns | Retention | Used by |
|---|---|---|---|
| `mms_reports` | `id uuid pk`, `created_at`, `token text unique not null`, `skills jsonb`, `matches jsonb`, `"current_role" text`, `email text null`, `source text`, `expires_at timestamptz` (defaults to now + 12 months) | 12 months, then delete | Results link and paid report (product) |
| `mms_purchases` | `id uuid pk`, `created_at`, `stripe_session_id text unique`, `report_id uuid` (FK to `mms_reports`, `ON DELETE SET NULL`), `target_soc`, `email`, `amount_pence int`, `currency`, `status`, `fulfilled_at`, `delivery_email_id` | 6 years (tax), then delete | Guest checkout and webhook (product) |
| `mms_stripe_events` | `event_id text pk`, `type`, `created_at` | Can be purged after 90 days | Stripe webhook idempotency (product) |
| `mms_rate_limits` | `key text`, `window_start timestamptz`, `count int not null default 0`, pk `(key, window_start)` | 24 hours (purged by `src/lib/rate-limit.ts`) | `checkRateLimit()` |

`current_role` is a reserved word in PostgreSQL, so quote it in raw SQL. supabase-js
quotes column names for you.

Raw CV text is never written to any of these tables. The privacy policy promises this.

### Existing (unchanged by the revamp code, still live)

| Table | Rows (28 Sep 2026) | Notes |
|---|---|---|
| `mms_skill_assessments` | 3 | `input_text` holds full CV text (Apr and May 2026). Still written by `/api/assess` until the product rewrite lands. |
| `mms_email_leads` | 3 | `cv_text` holds full CV text. Same. CommandCenter reads this table (service role). |
| `mms_search_logs` | 3 | `query_text` holds the first 200 characters of the CV. |
| `mms_job_clicks` | 0 | Written by `/api/track-click` (no personal identifiers). |
| `mms_profiles` | 0 | Account profiles; accounts removed. CommandCenter reads this table. |
| `mms_employers`, `mms_featured_jobs` | 0 / 0 | Recruiter features removed. |

Do not drop any of these without asking the owner, and update CommandCenter
(`src/lib/signup-attribution.ts`, `src/app/api/signups/route.ts`) first if
`mms_profiles` or `mms_email_leads` go.

## Jobs that must exist once 004 is applied

The privacy policy says results are deleted after 12 months. Something has to do it,
for example a daily Vercel cron route using the service-role client:

```sql
DELETE FROM public.mms_reports WHERE expires_at < now();
DELETE FROM public.mms_purchases WHERE created_at < now() - interval '6 years';
DELETE FROM public.mms_stripe_events WHERE created_at < now() - interval '90 days';
```

## Owner decision: the 3 stored CVs

Three rows from April and May 2026 hold full CV text (one is the owner's own test). The
new privacy policy says raw CV text is not kept after analysis. Suggested, once approved:

```sql
UPDATE public.mms_skill_assessments SET input_text = NULL WHERE input_text IS NOT NULL;
UPDATE public.mms_email_leads SET cv_text = NULL WHERE cv_text IS NOT NULL;
UPDATE public.mms_search_logs SET query_text = NULL WHERE search_type = 'assessment';
```

Not included in any migration because it changes personal data and needs the owner's yes.
