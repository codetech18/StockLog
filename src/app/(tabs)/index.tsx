import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Money } from '@/components/money';
import { SegmentedControl } from '@/components/segmented-control';
import { Stat, StatRow } from '@/components/stat-row';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatHeaderDate, formatTime, getPeriodStartDateString, periodLabel, type Period } from '@/lib/date';
import { maskImei } from '@/lib/imei';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';

const PERIODS: readonly Period[] = ['Today', 'Week', 'Month'];

type ActivityEntry = {
  id: string;
  kind: 'in' | 'out';
  deviceName: string;
  meta: string;
  amount: number;
  createdAt: string;
};

export default function LedgerScreen() {
  const { colors } = useAppTheme();
  const { inventory, sales, refresh } = useOffline();
  const [hideBalance, setHideBalance] = useState(false);
  const [period, setPeriod] = useState<Period>('Today');

  function toggleHideBalance() {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    setHideBalance((v) => !v);
  }

  function handlePeriodChange(next: Period) {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    setPeriod(next);
  }

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const periodStart = getPeriodStartDateString(period);
  const periodSales = sales.filter((sale) => sale.date_of_sale >= periodStart);
  const periodAdditions = inventory.filter((item) => item.date_of_entry >= periodStart);
  const inStock = inventory.filter((item) => item.status === 'in_stock');

  const stockValue = inStock.reduce((sum, item) => sum + item.cost_price, 0);
  const periodTakings = periodSales.reduce((sum, sale) => sum + sale.selling_price, 0);
  const periodMargin = periodSales.reduce(
    (sum, sale) => sum + (sale.inventory ? sale.selling_price - sale.inventory.cost_price : 0),
    0
  );

  const activity: ActivityEntry[] = [
    ...periodAdditions.map((item) => ({
      id: item.id,
      kind: 'in' as const,
      deviceName: item.device_name,
      meta: `${formatTime(item.created_at)} · ${item.condition === 'New' ? 'new' : 'used'}`,
      amount: item.cost_price,
      createdAt: item.created_at,
    })),
    ...periodSales.map((sale) => ({
      id: sale.id,
      kind: 'out' as const,
      deviceName: sale.inventory?.device_name ?? 'Unknown device',
      meta: `${formatTime(sale.created_at)} · ${maskImei(sale.inventory?.imei ?? null) ?? 'no IMEI'}`,
      amount: sale.selling_price,
      createdAt: sale.created_at,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="eyebrow" color="inkFaint">
          {formatHeaderDate()}
        </ThemedText>
        <ThemedText type="heading" style={styles.heading}>
          Ledger
        </ThemedText>

        <View style={styles.hero}>
          <View style={styles.heroLabelRow}>
            <ThemedText type="eyebrow" color="inkFaint">
              Stock value
            </ThemedText>
            <Pressable onPress={toggleHideBalance} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
              <Ionicons name={hideBalance ? 'eye-off-outline' : 'eye-outline'} size={15} color={colors.inkFaint} />
            </Pressable>
          </View>
          {hideBalance ? (
            <ThemedText type="figureLarge">••••••••</ThemedText>
          ) : (
            <Money amount={stockValue} type="figureLarge" />
          )}
        </View>

        <View style={styles.periodWrap}>
          <SegmentedControl options={PERIODS} value={period} onChange={handlePeriodChange} />
        </View>

        <StatRow>
          <Stat label="Units" first>
            <ThemedText type="figureMedium">{inStock.length}</ThemedText>
          </Stat>
          <Stat label={`Sold ${periodLabel(period)}`}>
            <Money amount={periodTakings} type="figureMedium" color="accentText" />
          </Stat>
          <Stat label="Margin">
            <Money amount={periodMargin} type="figureMedium" color="accentText" />
          </Stat>
        </StatRow>

        <ThemedText
          type="eyebrow"
          color="inkFaint"
          style={[styles.sectionHeader, { borderBottomColor: colors.rule }]}
        >
          {period === 'Today' ? "Today's activity" : `Activity ${periodLabel(period)}`}
        </ThemedText>

        <FlatList
          data={activity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.rule }]} />}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <ThemedText type="metaMono" color="lineNumber" style={styles.lineNumber}>
                {String(index + 1).padStart(2, '0')}
              </ThemedText>
              <View style={styles.rowMain}>
                <ThemedText type="rowPrimary">{item.deviceName}</ThemedText>
                <View style={styles.rowMetaLine}>
                  <ThemedText type="metaMono" color="inkFaint">
                    {item.meta}
                  </ThemedText>
                  <Tag label={item.kind === 'in' ? 'IN' : 'SOLD'} variant={item.kind === 'in' ? 'new' : 'sold'} />
                </View>
              </View>
              <Money amount={item.amount} type="figure" color={item.kind === 'out' ? 'clay' : 'ink'} negative={item.kind === 'out'} />
            </View>
          )}
          ListEmptyComponent={
            <ThemedText type="body" color="inkSoft" style={styles.empty}>
              No activity {periodLabel(period)}.
            </ThemedText>
          }
        />
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
  hero: { gap: Spacing.one, marginBottom: Spacing.four },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodWrap: { marginBottom: Spacing.three },
  sectionHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
  },
  listContent: { paddingBottom: Spacing.five },
  separator: { height: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 13, gap: Spacing.two },
  lineNumber: { width: 16, paddingTop: 2 },
  rowMain: { flex: 1, gap: Spacing.half },
  rowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  empty: { textAlign: 'center', marginTop: Spacing.four },
  pressed: { opacity: 0.6 },
});
