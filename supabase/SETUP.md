# Supabase Setup Instructions

## 1. Create Project
Go to https://supabase.com/dashboard and create a new project:
- Name: matchmyskillset
- Region: eu-west-2 (London)
- Database password: (generate a strong one)

## 2. Run Migration
Go to SQL Editor in the dashboard and paste the contents of `migrations/001_initial_schema.sql`

## 3. Get Keys
From Project Settings > API:
- Project URL (e.g. https://xxxxx.supabase.co)
- anon key
- service_role key

## 4. Add to Vercel
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## 5. Add to .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 6. Set Fred as Admin
After Fred signs up, run in SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'fred@example.com';
```

## 7. Configure Auth
In Authentication > URL Configuration:
- Site URL: https://matchmyskillset.com
- Redirect URLs: https://matchmyskillset.com/api/auth/callback
