# StockLog

## Project Overview
- Name: StockLog
- Purpose: Mobile inventory app for gadget dealers in Computer Village, Lagos. Replaces the paper notebook dealers use to track phone stock, IMEIs, and sales.
- Users: Non-technical phone/gadget dealers, mostly on iPhone. Must feel as simple as filling a paper book.
- Theme: Light "digital ledger" aesthetic. Warm paper, espresso ink, one emerald accent. Full system in DESIGN.md, which is the source of truth for all visual decisions.

## Tech Stack
- React Native + Expo (Expo Router for navigation)
- Supabase (auth, Postgres database, storage)
- MMKV for offline local cache
- Expo Camera for IMEI barcode scanning
- EAS Build for generating APK/IPA

## Project Structure
- `/src/app` — Expo Router screens (file-based routing), tab screens live under `/src/app/(tabs)`
- `/src/components` — shared UI components
- `/src/lib` — Supabase client, helpers, types
- `/src/constants` — theme tokens (colors, spacing, typography)
- `/supabase/migrations` — SQL migrations, source of truth for applying SCHEMA.md to a Supabase project

See SCHEMA.md for the full database schema. See PRD.md for product spec and feature scope. See DESIGN.md for the design system (colors, type, components, ledger patterns).

## Conventions
- TypeScript everywhere, no `.js` files in `/src/app` or `/src/components`
- Functional components only, no class components
- Theme tokens (colors in OKLCH, type roles) come from `/src/constants/theme.ts`, defined per DESIGN.md — never hardcode colors or pick fonts ad hoc in components
- All Supabase queries go through `/src/lib/supabase.ts`, never instantiate the client elsewhere
- Every table query must respect Row Level Security — never bypass with service role key in client code
- Money values stored and handled as integers (kobo/naira whole numbers), formatted for display only at the UI layer
- IMEI is a unique constraint at the database level — handle duplicate insert errors gracefully in the UI, never let them crash a screen

## Build & Run Commands
- `npx expo start` — start dev server
- `npx expo start --clear` — start with cache cleared
- `eas build --platform android --profile preview` — generate test APK
- `eas build --platform android --profile production` — production Android build
- `eas build --platform ios --profile preview` — generate iOS build for TestFlight (see PRD.md Platform Note)

## Out of Scope for MVP
Do not build these unless explicitly asked: multi-staff accounts, role permissions, PDF/Excel export, debt/credit tracking, analytics/reports beyond the dashboard stats. These are intentionally deferred to the paid tier.

## Workflow
- Build one screen or one feature at a time. Confirm it works before moving to the next.
- After completing a feature, update PROGRESS.md with what was built, what's next, and any open issues.
