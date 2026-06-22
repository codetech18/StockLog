# StockLog — Product Requirements Document

## Problem
Gadget dealers in Computer Village, Lagos track inventory in physical notebooks — device name, IMEI, date of entry, date of sale, price. These books get lost or damaged, can't be searched, and give the dealer no real visibility into their own business (e.g. "how many iPhones did I sell this month?").

## Solution
A mobile app that digitizes the exact workflow dealers already use, with zero added complexity. Log a device when it comes in, mark it sold when it goes out, see simple stats. Nothing dealers need to "learn" — just a faster, safer version of the notebook.

## Target Users
- Primary: Independent gadget dealers in Computer Village, Ikeja. Mostly iPhone users, low to moderate tech literacy.
- Expansion: Dealers in other Nigerian electronics markets (Alaba, Onitsha, Aba) once validated.

## Business Model
- Free tier at launch to build trust and a user base without friction.
- Future paid tier (₦2,000–₦5,000/month): unlimited inventory entries, multi-staff access, PDF/Excel export, debt/credit tracking, advanced reports.
- Free tier stays capped (e.g. 50–100 active inventory items) once paid tier launches.

## Platform Strategy
- React Native + Expo, single codebase for Android and iOS.
- Android (Play Store) ships first — faster review, matches a meaningful share of the market, and lets the founder gather real usage data before submitting to Apple.
- iOS (App Store) follows once there's a working app and some traction to show in review.

## MVP Screens

### 1. Auth
- Sign up / log in (Supabase Auth)
- First-time shop setup: shop name, owner name

### 2. Dashboard
- Today's revenue (hero stat)
- In-stock count, sold-today count
- Recent sales activity feed
- Floating "+" to add a new item

### 3. Inventory
- List of all logged devices, in-stock and sold
- Search by device name or IMEI
- Filter by condition (New / UK Used / NG Used)
- IMEI masked in list view (e.g. last 4 digits visible)

### 4. Add Item
- Device name, brand, storage, color
- IMEI — manual entry or camera scan
- Condition selector (pill buttons, not dropdown)
- Cost price and selling price
- Date of entry auto-filled

### 5. Sales
- Record a sale against an existing inventory item
- Buyer name and phone (optional)
- Payment method: Cash or Transfer
- Full sales history, grouped by day

### 6. Settings
- Shop profile
- Plan status (Free / Paid, once paid tier exists)
- Sign out

## Explicitly Out of MVP Scope
- Multi-staff accounts and role-based permissions
- PDF/Excel export
- Debt/credit tracking
- Reports beyond basic dashboard stats

These are reserved as the reason a dealer upgrades to paid later.

## Design Direction
- Light theme, warm off-white background (not pure white), one accent color (blue)
- Mobile-first, thumb-friendly tap targets, bottom tab navigation
- Should feel closer to a clean fintech app than an enterprise inventory tool
- Monospace font for prices and IMEIs to aid scanability

## Security Requirements (non-negotiable from day one)
1. Row Level Security on every Supabase table, scoped by `shop_id`
2. Auth tokens stored in Expo SecureStore, never plain AsyncStorage
3. Unique constraint on IMEI column, with a clear in-app error on duplicate entry

## Competitive Landscape
Bumpa and Kippa are the two dominant Nigerian SME tools in this space, and both are structurally unsuited to gadget resale:
- Both are built around SKU/quantity inventory ("10 units of Product X at ₦Y each"), not individually serialized, individually priced units. Two iPhones of the same model can have very different cost/selling prices depending on condition and source; neither tool models that cleanly.
- Neither treats device condition (New / UK Used / NG Used) as a first-class concept, it's the single biggest price driver in this market and has no clean equivalent in their data models.
- Bumpa pulls users toward an e-commerce storefront (website, social integration, multi-channel orders) that's irrelevant for a face-to-face market stall, and is no longer free, requiring a paid plan after a 14-day trial.
- Kippa's core bookkeeping app is free, but it's debt/expense-first with inventory as a secondary feature, not built for speed-of-logging during a busy stall day.
- Neither has IMEI-level uniqueness enforcement, which matters here both as a data-quality safeguard and as a trust/fraud signal (cloned or stolen devices).

StockLog's positioning is not "Bumpa/Kippa but for phones," it's that gadget resale has a fundamentally different unit of record (the individual device, not the SKU). IMEI tracking is the most visible symptom of that gap, but per-unit economics, condition-as-data, and a lean offline-first tool are the deeper differentiators.

## Platform Note: iOS Testing
Target users are predominantly iPhone owners, but Android ships to the Play Store first for speed of iteration (see Platform Strategy above). This means the Stage 7 real-world dealer pilot needs an iOS build the test dealers can actually install, which the production Play Store release won't provide. Use TestFlight for this: it allows distributing a working build to testers via a public link with much lighter review than a full App Store submission. This pulls the Apple Developer account ($99/year) forward to roughly Stage 6-7, rather than waiting until Stage 8.

## Success Criteria for MVP

- A real dealer can log a device, mark it sold, and see it reflected on the dashboard without any explanation from the founder
- App works fully offline and syncs correctly once back online
- Zero data leakage across different shop accounts
