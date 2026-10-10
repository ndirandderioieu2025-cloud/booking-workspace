# Booking Workspace

Booking Workspace is an unofficial university concept exploring how Booking.com could offer cafés, study spaces, coworking desks and meeting rooms by the hour.

## Stages 1 to 4

The current prototype includes:

- a responsive Booking Workspace homepage and navigation
- an original pale-blue design system
- an interactive search form with validation and URL parameters
- ten fictional Madrid listings with affordable, clearly labelled hourly prices
- live search by workspace name, city or neighbourhood
- availability checks for date, start time, duration, capacity and number of people
- filters for price, free or paid access, type, Wi-Fi, outlets, quiet spaces and capacity
- sorting by recommendation, price and demo score
- responsive search-result cards and individual workspace profile pages
- preserved search criteria between results and workspace profiles
- interactive booking controls on every workspace profile
- real price calculations for per-person, per-desk, per-room and free reservations
- opening-hours, past-date, capacity and overlap validation
- available half-hour start slots based on existing demonstration reservations
- reservation review, supported payment choices and final availability rechecking
- unique booking references and professional confirmation pages
- a functional My Bookings page with upcoming, past and cancelled reservations
- cancellation-policy checks that release reserved capacity
- Supabase email/password authentication with persistent cookie sessions
- PostgreSQL storage for profiles, workspaces, availability and reservations
- atomic database booking and cancellation functions that enforce capacity
- Row Level Security so users can only access their own reservations
- an optional, duplicate-safe import for earlier local demonstration bookings
- responsive desktop and mobile layouts
- functional account, sign-in, registration and sign-out interfaces
- accessible loading, error and empty states
- original fictional workspace photography

## Run locally

1. Install dependencies with `npm install`.
2. For the full Stage 4 experience, follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
3. Start the development server with `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

If Supabase is not configured, the app deliberately keeps its Stage 3 local demonstration mode. This makes the interface previewable without credentials, but shared availability, accounts and database bookings require Supabase.

## Project roadmap

- Stage 2: complete, with listings, search results, filters, sorting and profile pages
- Stage 3: complete, with availability, reservation flow, simulated payments, confirmations and cancellations
- Stage 4: complete in code, with Supabase authentication, persistent data, RLS and atomic booking
- Stage 5: simulated payments, confirmations and cancellations
- Stage 6: final testing and Netlify deployment

All current venue names, demo scores, addresses and prices are fictional sample data for academic demonstration.

## Existing demonstration storage

Earlier reservations stored in `localStorage` are retained and shown separately in My Bookings. After signing in, the user may explicitly import eligible confirmed reservations. The database keeps each local reference unique per account, so running the import again does not create duplicates. Local data is never deleted automatically.

Online payment remains a simulation. No card information is requested or stored.
