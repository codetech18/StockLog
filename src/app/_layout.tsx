import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { BootSplash } from '@/components/boot-splash';
import { PinLockScreen } from '@/components/pin-lock-screen';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { OfflineProvider } from '@/lib/offline-context';
import { PinProvider, usePin } from '@/lib/pin-context';
import { ThemeProvider, useAppTheme } from '@/lib/theme-context';

SplashScreen.preventAutoHideAsync();

// Keep our own rich splash on screen for a minimum stretch so it isn't just a flash
// on fast loads — the native splash hands off to it instantly underneath.
const MIN_SPLASH_MS = 1100;

function AppShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, shop, isLoading } = useAuth();
  const { colorScheme, colors } = useAppTheme();
  const { hasPin, isUnlocked, isReady: pinReady } = usePin();
  const pathname = usePathname();
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const dataReady = fontsLoaded && !isLoading && pinReady;
  const isReady = dataReady && minDurationElapsed;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => setMinDurationElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  // Don't mount BootSplash until fonts are confirmed loaded — rendering it a frame early
  // (while its custom-font text still measures against a fallback typeface) is what caused
  // the wordmark to visually clip on Android once the real font swapped in without a relayout.
  if (!fontsLoaded) {
    return null;
  }

  if (!isReady) {
    return <BootSplash />;
  }

  // Excluded from the PIN gate: a recovery session (forgotten-password flow) shouldn't
  // get blocked by a second, unrelated lock — especially since someone resetting a
  // forgotten password may not remember their PIN either.
  if (session && shop && hasPin && !isUnlocked && pathname !== '/forgot-password') {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <PinLockScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!session && !shop}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={!!session && !!shop}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sell/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="shop-profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="coming-soon" options={{ presentation: 'modal' }} />
          <Stack.Screen name="set-pin" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Screen name="forgot-password" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <PinProvider>
            <AppShell fontsLoaded={fontsLoaded} />
          </PinProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
