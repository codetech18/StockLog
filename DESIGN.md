# StockLog — Design System

The look is a **digital ledger**, not a SaaS dashboard. It replaces a paper notebook, so the interface should feel like a clean, modern account book: ruled lines, aligned figures, warm paper. Avoid floating-card dashboards, big centered hero-metric cards, and generic blue-on-white. Spend boldness on the ledger feel; keep everything else quiet.

## Theme
Light by default, with an optional dark mode (user-toggled from More → App → Dark mode, persisted locally). The scene: a dealer glancing at their phone between customers in a bright, fluorescent-lit stall during a busy market day — or after closing, in a dim back room. Warm paper surfaces, espresso ink, one disciplined accent in light mode; warm charcoal surfaces, cream ink, a brightened accent in dark mode. Never pure black or pure white in either.

## Color
Defined as `LightColors`/`DarkColors` tokens in `/constants/theme.ts`. Never hardcode hex or import `LightColors`/`DarkColors` directly in a screen — pull the active palette from `useAppTheme().colors` (or via `ThemedText`/`ThemedView`'s `color` prop) so the screen reacts to the theme toggle.

| Token | Light hex | Dark hex | Use |
|---|---|---|---|
| paper | #FAF9F6 | #1C1A17 | app background |
| surface | #FEFEFC | #272420 | raised surfaces (nav bar, search field) — lighter than paper in both themes |
| ink | #2B2723 | #F2EFEA | primary text, strong rules |
| inkSoft | #7C766E | #B8B2A8 | secondary text |
| inkFaint | #A8A29A | #7D766C | meta text, placeholders, icons, eyebrow labels |
| lineNumber | #BCB6AB | #5C564C | ledger line numbers (01, 02…), muted ₦ on neutral figures |
| rule | #E9E6E0 | #3A3631 | hairline row dividers |
| ruleStrong | #D8D3CB | #4A453E | input underlines, chip borders |
| accent / accentText | #137A5C | #1FA37A / #2BC495 | brand, primary buttons, active nav, profit, "New"/"In" tags |
| accentSoft | #E3F3EC | #16332B | "New"/"In" tag bg |
| onAccent | #FAF9F6 | #FAF9F6 | text/icons on an accent-filled surface (button labels, FAB icon) — fixed light tone in *both* themes, since accent itself doesn't flip lightness the way ink/paper do |
| clay | #B04A30 | #D6694A | sold / money out / sign-out / destructive |
| claySoft | #F6E7DF | #3A211A | "Sold" tag bg |
| amber | #A87C2E | #C99A4A | "UK Used" tag, Cash figure |
| amberSoft | #F7ECD6 | #332710 | amber tag bg |

**Dark mode is not just inverted lightness:** raised surfaces go *lighter* than the base (not darker, matching standard dark-UI elevation), "soft" tag fills become dark muted tones instead of pale washes, and accent/clay/amber are brightened slightly to hold contrast against a dark field — direct light-mode hex values read muddy on dark.

**Color logic is semantic, never decorative:** accent green = brand / in stock / incoming / profit. clay = sold / money out. amber = Cash / UK-used. NG-used is a neutral grey tag.

**Currency convention:** neutral (ink) figures render the `₦` symbol in the quiet `lineNumber` tone with digits in `ink`, so the digits form a saturated column (handled automatically by the `Money` component). Semantic figures (clay/accent/amber) apply that color across symbol + digits uniformly.

## Typography
Two faces, loaded via Expo fonts (expo-font / @expo-google-fonts). Type roles live in `Type` in `/constants/theme.ts`:

- **Plus Jakarta Sans** — all UI text, labels, headings. Switched from Space Grotesk because Space Grotesk's distinctive geometric character shapes read as quirky/less professional for a daily business tool; Plus Jakarta Sans is more neutral while still having some warmth (and is a common choice in fintech-adjacent apps, a reasonable fit for a money-tracking ledger). Heading (H1) 32px/600, letter-spacing -1px. Eyebrow/section header/field label: 10px/600 uppercase, letter-spacing 1.6px. Stat mini-label: 9px/600 uppercase. Row primary (device/ticket name): 15px/500. Settings row label: 16px/500.
- **Space Mono** — every figure: prices, IMEIs, counts, dates, timestamps. Row amount: 15px/700. Stat figure: 19px/700. Hero figure (Stock value / Sales today): 36px/700, letter-spacing -0.7px. Line numbers + row meta (time/IMEI): 11px/400.

## Layout patterns
- **Ledger rows, not cards.** Lists are rows separated by 1px `rule` hairlines, ~13px vertical padding. No card backgrounds, no shadows, no rounded containers around list items.
- **Numbered ledger lines.** Recent activity / stock / sales rows are prefixed with a padded line number (`01`, `02`…) in mono `lineNumber` tone — reinforces the ledger-book metaphor.
- **No nested containers.** Most content sits directly on paper.
- **Ledger header line.** Key totals (Stock value, Sales today) are presented as an account line: small uppercase label, large mono hero figure. No heavy rule under the hero figure (an earlier version had one — removed deliberately).
- **Hide balance.** The Ledger's Stock value has a tappable eye icon that toggles the figure to `••••••••`.
- **Money out shows a minus** in clay with tabular mono.
- **Right-align all figures** in list rows so they form a column.
- **Stat trio.** Three equal columns, divided by a 1px `rule` left-border + 16px left padding (not a centered spacer). Label sits above the figure.

## Components
- **Tag/pill:** 10.5px/700, padding 2px 7px, radius 5px, soft bg + matching fg from the pairs above. Variants: `new`/`ukUsed`/`ngUsed` (condition), `sold`. The `new` variant doubles as the Ledger's "IN" movement tag.
- **Filter chips (Stock):** pill-shaped (radius 20px), outline by default, `accent` fill + `onAccent` text when selected, animated crossfade between the two states (~160ms). Built dynamically from the distinct brands present in inventory, not a fixed list. Horizontally scrollable so a long brand list doesn't wrap.
- **Inputs:** underlined only (border-bottom 1.5px), no filled boxes. Default underline `ruleStrong`; the required, highest-signal fields (Brand, Color, selling price) use an `accent` underline. Label above in uppercase eyebrow style; `labelRight` slot for an inline action (e.g. IMEI's "Scan" affordance). The Stock screen's search field is the one exception — a filled, fully-bordered rounded box (`surface` fill, `ruleStrong` border, 11px radius), not an underline, to read as a distinct search affordance.
- **Add/Edit form required fields:** Device name, Brand, Color, Cost price, Selling price. **IMEI is optional** — some stock (accessories, etc.) has none; when entered it's still validated as exactly 15 digits, just not required to be present. A device with no IMEI shows "No IMEI" wherever the masked IMEI would otherwise appear (Stock row, Sell screen, Ledger activity feed).
- **Segmented control** (e.g. condition): single bordered group, active segment indicated by an `ink`-filled thumb that slides between segments (~180ms) rather than snapping, with `paper` text on the active segment.
- **Primary button:** `accent` bg, `onAccent` text, radius 13px, 16px vertical padding, 700 weight.
- **Settings rows:** label left, value/switch/chevron right, 1px `rule` bottom separator, 44px min height, opacity dip on press. Disclosure chevron is an Ionicons `chevron-forward` glyph (not a hand-drawn rotated square — that looked like a rendering glitch on a real device).
- **Bottom nav:** 5 items on `surface` with a top `rule`, opacity dip on press. Center action is a raised `accent` shape with a soft accent shadow — circular on iOS (raised above the bar, paper ring), rounded-square on Android (sits inline in the bar, Material FAB idiom). Active tab icon + label in accent, inactive in inkFaint. Labels: Ledger, Stock, (add), Sales, More.
- **Stock row tap, in-stock:** opens an action sheet (`Record sale` / `Edit details` / `Cancel`) rather than navigating straight to Sell. `Edit details` opens a dedicated edit screen pre-filled with the device's current fields (for fixing a typo from when it was logged) and includes a destructive `Delete device` action with a confirm step. Editing or deleting a sold item is intentionally not supported, since its sale already captured a snapshot of the figures (the DB also rejects deleting a row a `sales` record still references) — sold rows get a *different* action sheet instead (see below).
- **Stock row tap, sold:** opens a one-action sheet — `Restore to stock` (+ Cancel) — for the customer-return case. Restoring deletes the `sales` row and flips the device back to `in_stock`; it does not keep a "this was once sold and returned" audit trail, since that wasn't asked for, just the ability to undo.
- **Period selector (Ledger, Sales):** a 3-way `SegmentedControl` (`Today` / `Week` / `Month`) above the stat trio. "Week"/"Month" are trailing windows (last 7/30 days inclusive of today), not calendar week/month — so the numbers don't look artificially small just because today happens to be the 2nd of the month. Affects the stat trio, the Ledger's "Recent activity" feed, and the Sales history list (all re-filtered to the selected window); "Stock value" and "Units" on Ledger are current snapshots and don't change with the period.

## Splash
A bold inversion of the theme: full `#137A5C` emerald field, centered paper-colored rounded-square mark (104px, radius 26) with the brand glyph in emerald, "StockLog" wordmark (paper), "INVENTORY LEDGER" tagline (mint `#A8D7C6`, 0.28em tracking), a 44px hairline, and a footer of three descending-opacity dots + "Computer Village · Lagos" in mono mint. These colors (`#137A5C` field, `#0F6149` border, `#A8D7C6` mint, `#2C8E6E` hairline) are splash-only and appear nowhere else in the app. Implemented as an in-app component (`BootSplash`) shown immediately after the native (solid-color) splash hands off, with a ~1.1s minimum display time so it doesn't flash by on fast loads.

## App icon
The same mark as the splash, simplified: a `#FAF9F6` paper rounded-square card on a full-bleed `#137A5C` emerald field, with three emerald horizontal bars inside the card standing in for ruled lines (rather than the splash's Ionicons glyph, which doesn't translate to a flat icon at small sizes). iOS uses the Icon Composer bundle (`assets/expo.icon`) — a hand-authored SVG silhouette with cutouts for the bars, masked over a solid emerald fill defined in `icon.json`, so the bars render as "the background showing through" rather than a second color. Android's adaptive icon foreground (`assets/images/android-icon-foreground.png`) is the same design as a flat PNG, sized so the card sits within the ~66% safe zone various launcher mask shapes won't clip; the adaptive background is a plain `backgroundColor` (no separate image needed for a flat fill).

## Auth & onboarding screens
Sign-up, log in, forgot/reset password, and shop setup all open with a small `BrandMark` — a 56px rounded square, `accent` fill, the same Ionicons "reader-outline" glyph as the splash/icon in `onAccent`. These screens were plain text-on-paper before; the mark ties them back to the splash/icon identity without needing a new asset. Otherwise unchanged: same `TextField`/`PrimaryButton` components as the rest of the app, no special auth-only styling.

## Security
- **App PIN (optional, off by default):** a 4-digit local lock, set/changed/turned off from More → Security → App PIN. Entry is a dots-and-keypad combo (`PinPad`): a row of progress dots above a custom 3×4 on-screen numeric keypad (1–9, 0, backspace), with a selection haptic on every key tap — no system keyboard involved, so it looks and feels the same on every device rather than depending on whatever number-pad keyboard the OS happens to show. The PIN itself is never stored in plaintext — only its SHA-256 hash, in `expo-secure-store` (Keychain/Keystore-backed, same mechanism already used for Supabase auth tokens). Locks again on every background→foreground transition, not just cold launch — a PIN that only checks once at launch is trivially bypassed by suspending instead of closing the app. The lock screen takeover (`PinLockScreen`) is rendered directly in the root layout the same way `BootSplash` is, not a routed screen — it's a state gate, not something the user navigates *to*.
- **Forgot/reset password is code-based, not a clickable link.** A magic-link flow was tried first and abandoned: Supabase's reset email links to *their* server first, which then redirects to the app's custom scheme — and modern mobile browsers (Chrome on Android especially) block automatic redirects to a custom scheme unless a real tap triggered them, so the handoff just shows a blank page. There's no hosted web page for this project to bounce through instead (mobile-only, no website), so the robust fix for this app specifically is the code-based recovery flow Supabase supports natively: request (`/forgot-password`, stage "request") emails a 6-digit code via `resetPasswordForEmail`; the same screen's second stage takes the code + new password, calls `verifyOtp({ token, type: 'recovery' })` to establish the recovery session, then `updateUser({ password })` — no link, no redirect, nothing for a browser to block. **Needs the Supabase email template edited** (Dashboard → Authentication → Email Templates → "Reset Password") to actually show `{{ .Token }}` in the body — the default template only shows the link. `forgot-password.tsx` is a top-level route (not nested under `(auth)`'s `guard={!session}`) so that the session `verifyOtp` establishes mid-flow can't get the screen redirected away before `updateUser` runs — and, like the PIN gate, excludes this route: someone recovering a forgotten password may not remember their PIN either.

## Motion
Subtle, ease-out only (cubic-bezier(0.22,1,0.36,1)). No bounce/elastic. Animate transforms/opacity, never layout properties. Haptic tick on marking a device sold and on successful save. Press feedback (opacity dip) on every tappable row/button. List changes on the Stock screen (search/filter) and the Ledger's hide-balance toggle use a brief `LayoutAnimation` fade rather than an abrupt jump cut.

## Copy
Sentence case, plain verbs, active voice. Buttons say what happens ("Log device", not "Submit"). No em dashes. Errors state what went wrong and how to fix it, in the app's voice. Empty states invite the first action (e.g. "No devices logged yet. Tap + to add your first.").

## Quality floor
Thumb-friendly tap targets (min 44px), visible focus states, respect reduced-motion, support the smallest common Android screen width without horizontal scroll.

## Known scope decisions
- **No quantity/multi-unit stock.** Every inventory row is one physical device with one IMEI (unique DB constraint) — there is deliberately no "×N" quantity badge anywhere, even though an earlier design exploration showed one. A dealer cannot stock multiple units under a single IMEI.
- **Staff & roles and Backup & export are out of scope for MVP** (per CLAUDE.md — deferred to the paid tier) and are not present anywhere in the More/Settings screen, even though an earlier design exploration included them.
- **Price list, Help & support, and IMEI barcode Scan are visual placeholders.** They render per the design (so the screen doesn't look incomplete) but route to a "Coming soon" screen / show an alert — there's no catalog/support/camera-scanning feature built yet.

Reference implementation of this system: `StockLog_Ledger.jsx` (original mockup) and the `design_handoff_stocklog 2` handoff package (current source of truth where the two disagree).
