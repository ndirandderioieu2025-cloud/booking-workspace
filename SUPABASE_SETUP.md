# Supabase setup for Booking Workspace

These steps enable accounts, shared availability and persistent reservations. No secret service-role key is needed by the website.

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Wait for the database to finish provisioning.
3. Open **Project Settings > API** or the project's **Connect** dialog.
4. Copy the Project URL and the publishable key. Older projects may call this the anonymous key.

The publishable key is safe to expose in the browser only because every table is protected by Row Level Security. Never use the service-role or secret key in this Next.js application.

## 2. Create the database

In the Supabase dashboard, open **SQL Editor > New query**.

1. Paste and run `supabase/migrations/202610100001_stage4_schema.sql`.
2. Paste and run `supabase/seed.sql`.
3. Open **Table Editor > workspaces** and confirm that 10 fictional Madrid listings are present.

The migration creates:

- `profiles`, linked to Supabase Auth users
- `workspaces`, containing the existing fictional listings
- `workspace_availability`, for closures, hours and capacity overrides by date
- `reservations`, including booking, payment and cancellation status
- private Row Level Security policies
- `create_reservation`, an atomic database function that locks a workspace, recomputes the total and prevents overbooking
- `cancel_reservation`, which verifies ownership and the cancellation deadline
- `get_workspace_available_slots`, which exposes capacity-safe time slots without exposing another user's reservations

## 3. Configure authentication

Open **Authentication > URL Configuration** in Supabase.

For local testing:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

For Netlify, also add:

- `https://YOUR-NETLIFY-SITE.netlify.app/auth/callback`

Email confirmation can stay enabled. New users will then receive a confirmation link before their first sign-in.

## 4. Add local environment variables

Copy `.env.example` to `.env.local` and replace the placeholder values:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
```

Restart `npm run dev` after changing environment variables.

## 5. Test Stage 4

1. Open `/sign-in?mode=register`, create an account and confirm the email if required.
2. Sign in and refresh the page. The header should still show the account.
3. Open a workspace, choose a future slot and confirm a reservation.
4. Check that the confirmation reference begins with `BW-`.
5. Open My Bookings and verify the reservation, payment method and simulated payment status.
6. Cancel an eligible reservation and confirm that it moves to Past and cancelled.
7. Try the same slot again to confirm that released capacity can be reserved.
8. If Stage 3 bookings exist in the browser, use **Import to my account** once, then repeat it. The second import must skip the same references instead of duplicating them.
9. Create a second account and confirm it cannot read or cancel the first account's reservations.

## 6. Configure Netlify

Add the three environment variables from step 4 under **Site configuration > Environment variables**, using the deployed site URL for `NEXT_PUBLIC_SITE_URL`. Trigger a new deployment after saving them.

Run these checks before deployment:

```bash
npm run lint
npm run typecheck
npm run build
```

The online payment option is intentionally simulated. It stores only the method and the status `paid-simulated`; it never requests or stores card details.
