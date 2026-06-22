import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsRow } from '@/components/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { usePin } from '@/lib/pin-context';
import { StorageKeys, storage } from '@/lib/storage';
import { useAppTheme } from '@/lib/theme-context';

export default function MoreScreen() {
  const { shop, signOut } = useAuth();
  const { colors, colorScheme, toggleColorScheme } = useAppTheme();
  const { hasPin } = usePin();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    storage.getString(StorageKeys.notificationsEnabled) !== '0'
  );

  function handlePinTogglePress() {
    void Haptics.selectionAsync();
    router.push(hasPin ? { pathname: '/set-pin', params: { mode: 'disable' } } : '/set-pin');
  }

  function handleSignOut() {
    void Haptics.selectionAsync();
    Alert.alert('Sign out?', "You can log back in anytime — nothing you've logged will be lost.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  function toggleNotifications(value: boolean) {
    setNotificationsEnabled(value);
    storage.set(StorageKeys.notificationsEnabled, value ? '1' : '0');
  }

  function openComingSoon(title: string) {
    router.push({ pathname: '/coming-soon', params: { title } });
  }

  const sinceYear = shop ? new Date(shop.created_at).getFullYear() : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="eyebrow" color="inkFaint">
          Account
        </ThemedText>
        <ThemedText type="heading" style={styles.heading}>
          More
        </ThemedText>

        <View style={[styles.identity, { borderBottomColor: colors.ink }]}>
          <ThemedText type="rowPrimary" style={styles.shopName}>
            {shop?.shop_name}
          </ThemedText>
          {shop?.owner_name ? (
            <ThemedText type="metaMono" color="inkFaint">
              Owner · {shop.owner_name} · since {sinceYear}
            </ThemedText>
          ) : (
            <ThemedText type="metaMono" color="inkFaint">
              since {sinceYear}
            </ThemedText>
          )}
        </View>

        <ThemedText type="eyebrow" color="inkFaint" style={styles.sectionHeader}>
          Shop
        </ThemedText>
        <SettingsRow label="Shop profile" onPress={() => router.push('/shop-profile')} />
        <SettingsRow label="Price list" onPress={() => openComingSoon('Price list')} />

        <ThemedText type="eyebrow" color="inkFaint" style={styles.sectionHeader}>
          Security
        </ThemedText>
        <SettingsRow
          label="App PIN"
          value={hasPin ? 'On' : 'Off'}
          onPress={handlePinTogglePress}
        />

        <ThemedText type="eyebrow" color="inkFaint" style={styles.sectionHeader}>
          App
        </ThemedText>
        <SettingsRow label="Currency" value="₦ NGN" />
        <SettingsRow
          label="Dark mode"
          right={
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ true: colors.accent, false: colors.rule }}
              thumbColor={colors.surface}
            />
          }
        />
        <SettingsRow
          label="Notifications"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.accent, false: colors.rule }}
              thumbColor={colors.surface}
            />
          }
        />
        <SettingsRow label="Help & support" onPress={() => openComingSoon('Help & support')} />

        <SettingsRow label="Sign out" onPress={handleSignOut} destructive />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  heading: { marginTop: Spacing.one, marginBottom: Spacing.four },
  identity: {
    gap: Spacing.half,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1.5,
    marginBottom: Spacing.three,
  },
  shopName: { fontSize: 22, fontFamily: Fonts.sans.semiBold },
  sectionHeader: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
});
