import { Stack } from 'expo-router';

import { useAppTheme } from '@/lib/theme-context';

export default function OnboardingLayout() {
  const { colors } = useAppTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}
