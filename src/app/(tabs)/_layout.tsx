import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';

type TabButtonProps = TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
};

const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { icon, label, isFocused, ...pressableProps },
  ref
) {
  const { colors } = useAppTheme();
  const color = isFocused ? colors.accent : colors.inkFaint;
  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
    >
      <Ionicons name={icon} size={22} color={color} />
      {label ? (
        <ThemedText type="label" color={isFocused ? 'accent' : 'inkFaint'} style={styles.tabLabel}>
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
});

const AddTabButton = forwardRef<View, TabButtonProps>(function AddTabButton(
  { icon, ...pressableProps },
  ref
) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      style={({ pressed }) => [styles.addButtonWrap, pressed && styles.addButtonPressed]}
    >
      <View
        style={[
          styles.addButton,
          {
            backgroundColor: colors.accent,
            borderColor: colors.onAccent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <Ionicons name={icon} size={26} color={colors.onAccent} />
      </View>
    </Pressable>
  );
});

function OfflineBanner() {
  const { isOnline, pendingCount, syncError, fetchError } = useOffline();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (isOnline && pendingCount === 0 && !syncError && !fetchError) {
    return null;
  }

  const isError = Boolean(syncError || fetchError);
  const message =
    syncError ??
    fetchError ??
    (!isOnline
      ? pendingCount > 0
        ? `Offline — ${pendingCount} change${pendingCount === 1 ? '' : 's'} waiting to sync`
        : 'Offline — showing your last saved data'
      : `Syncing ${pendingCount} change${pendingCount === 1 ? '' : 's'}…`);

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: isError ? colors.claySoft : colors.amberSoft, paddingTop: insets.top + Spacing.one },
      ]}
    >
      <ThemedText type="label" color={isError ? 'clay' : 'inkSoft'}>
        {message}
      </ThemedText>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <OfflineBanner />
      <TabSlot />
      <TabList
        style={[
          styles.tabList,
          { backgroundColor: colors.surface, borderTopColor: colors.rule, paddingBottom: Math.max(insets.bottom, Spacing.two) },
        ]}
      >
        <TabTrigger name="ledger" href="/" asChild>
          <TabButton icon="reader-outline" label="Ledger" />
        </TabTrigger>
        <TabTrigger name="stock" href="/stock" asChild>
          <TabButton icon="layers-outline" label="Stock" />
        </TabTrigger>
        <TabTrigger name="add" href="/add" asChild>
          <AddTabButton icon="add" />
        </TabTrigger>
        <TabTrigger name="sales" href="/sales" asChild>
          <TabButton icon="trending-up-outline" label="Sales" />
        </TabTrigger>
        <TabTrigger name="more" href="/more" asChild>
          <TabButton icon="ellipsis-horizontal" label="More" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  tabLabel: {
    fontSize: 11,
  },
  tabButtonPressed: {
    opacity: 0.6,
  },
  addButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  // iOS: raised circle above the bar with a paper ring. Android: rounded-square FAB
  // sitting inline in the bar — the two platforms' native idioms, per the design spec.
  addButton: Platform.select({
    ios: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ translateY: -20 }],
      borderWidth: 4,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55,
      shadowRadius: 18,
      elevation: 6,
    },
    default: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55,
      shadowRadius: 18,
      elevation: 6,
    },
  }),
  banner: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
});
