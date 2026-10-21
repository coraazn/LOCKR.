# LOCKR

LOCKR is a Fortnite cosmetics collection tracker built with React and Vite. The catalogue and local locker work without an account. Supabase adds accounts, cloud-synced lockers, public profiles, and collection leaderboards.

## Run locally

```sh
npm install
npm run dev
```

## Enable accounts and shared leaderboards

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/20261020200000_lockr_accounts_and_lockers.sql`](./supabase/migrations/20261020200000_lockr_accounts_and_lockers.sql).
3. Create `.env.local` beside `package.json`:

   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
   ```

4. Restart the Vite development server after changing environment variables.
5. In Supabase Auth settings, allow your local URL (`http://localhost:5173`) and your deployed site URL for sign-in redirects.

Only use the Supabase URL and publishable (browser-safe) key in `VITE_` variables. Never put a `service_role` key or another secret in frontend code or environment variables prefixed with `VITE_`.

For Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project's environment variables, then redeploy.

## Data and score

Profiles and locker item IDs are publicly readable to power the community leaderboard. Each user can only create or update their own locker, enforced by Supabase row-level security. Collections are entered manually and are not verified against Epic accounts. Never enter Epic Games credentials or tokens in LOCKR.

The LOCKR score is an indicative community metric based on cosmetic rarity and series, not a resale price or an official Epic Games valuation.
