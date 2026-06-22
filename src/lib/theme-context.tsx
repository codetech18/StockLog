import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { DarkColors, LightColors, type ColorToken } from '@/constants/theme';
import { storage } from '@/lib/storage';

export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'theme:colorScheme';

function readStoredScheme(): ColorScheme {
  return storage.getString(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

type ThemeContextValue = {
  colorScheme: ColorScheme;
  colors: Record<ColorToken, string>;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(readStoredScheme);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    storage.set(STORAGE_KEY, scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storage.set(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      colors: colorScheme === 'dark' ? DarkColors : LightColors,
      setColorScheme,
      toggleColorScheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}
