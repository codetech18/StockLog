import { Stack } from 'expo-router';

import { useAppTheme } from '@/lib/theme-context';

export const unstable_settings = {
  initialRouteName: 'sign-up',
};

export default function AuthLayout() {
  const { colors } = useAppTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}
