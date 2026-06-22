/**
 * StockLog design tokens — see DESIGN.md for the full design system.
 * "Digital ledger" theme, light and dark. Never hardcode colors or fonts in components —
 * pull the active palette from useAppTheme()/ThemedText/ThemedView instead of importing
 * LightColors directly, so screens stay reactive to the theme toggle.
 */

export const LightColors = {
  paper: '#FAF9F6',
  surface: '#FEFEFC',
  ink: '#2B2723',
  inkSoft: '#7C766E',
  inkFaint: '#A8A29A',
  lineNumber: '#BCB6AB', // ledger line numbers, muted ₦ symbol on neutral figures
  rule: '#E9E6E0',
  ruleStrong: '#D8D3CB',
  accent: '#137A5C',
  accentText: '#137A5C',
  accentSoft: '#E3F3EC',
  // Fixed light tone for content sitting on an accent-colored fill (button labels, FAB
  // icon). Unlike ink/paper, accent doesn't flip lightness between themes, so it needs its
  // own always-light partner rather than reusing the theme-relative paper token.
  onAccent: '#FAF9F6',
  clay: '#B04A30',
  claySoft: '#F6E7DF',
  amber: '#A87C2E',
  amberSoft: '#F7ECD6',
} as const;

// Dark variant: same semantics, inverted weight. Raised surfaces go lighter (not darker)
// than the base, "soft" tag fills become dark muted tones instead of pale washes, and the
// accent/clay/amber hues are brightened slightly to hold contrast against a dark field —
// otherwise direct light-mode hex values read muddy on a dark background.
export const DarkColors = {
  paper: '#1C1A17',
  surface: '#272420',
  ink: '#F2EFEA',
  inkSoft: '#B8B2A8',
  inkFaint: '#7D766C',
  lineNumber: '#5C564C',
  rule: '#3A3631',
  ruleStrong: '#4A453E',
  accent: '#1FA37A',
  accentText: '#2BC495',
  accentSoft: '#16332B',
  onAccent: '#FAF9F6',
  clay: '#D6694A',
  claySoft: '#3A211A',
  amber: '#C99A4A',
  amberSoft: '#332710',
} as const;

/** @deprecated Use useAppTheme().colors so screens react to the theme toggle. Kept as the canonical key/type source. */
export const Colors = LightColors;

export type ColorToken = keyof typeof LightColors;

export const Fonts = {
  // Plus Jakarta Sans — all UI text, labels, headings.
  sans: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  // Space Mono — every figure: prices, IMEIs, counts, dates, timestamps.
  mono: {
    regular: 'SpaceMono_400Regular',
    bold: 'SpaceMono_700Bold',
  },
} as const;

export const Type = {
  // H1 screen title
  heading: { fontFamily: Fonts.sans.semiBold, fontSize: 32, letterSpacing: -1 },
  body: { fontFamily: Fonts.sans.regular, fontSize: 15 },
  // Row primary — device/ticket name
  rowPrimary: { fontFamily: Fonts.sans.medium, fontSize: 15 },
  // Generic secondary text; row-meta/IMEI/time uses still layer on a mono override
  label: { fontFamily: Fonts.sans.medium, fontSize: 11 },
  // Eyebrow / section header / field label — all 10px 600 uppercase in the spec
  eyebrow: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  // Stat trio mini-label
  statLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase' as const,
  },
  // Ledger line numbers + mono row meta (time, IMEI) — same size/weight, color varies
  metaMono: { fontFamily: Fonts.mono.regular, fontSize: 11 },
  // Settings list row label
  settingsRow: { fontFamily: Fonts.sans.medium, fontSize: 16 },
  // Row amount
  figure: { fontFamily: Fonts.mono.bold, fontSize: 15 },
  // Stat figure
  figureMedium: { fontFamily: Fonts.mono.bold, fontSize: 19 },
  // Hero figure (Stock value / Sales today)
  figureLarge: { fontFamily: Fonts.mono.bold, fontSize: 36, letterSpacing: -0.7 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  tag: 5,
  button: 13,
  nav: 16,
  pill: 20,
} as const;
