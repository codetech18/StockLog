import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LayoutAnimation, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Money } from '@/components/money';
import { SaleRow } from '@/components/sale-row';
import { SegmentedControl } from '@/components/segmented-control';
import { Stat, StatRow } from '@/components/stat-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatShortDate, getPeriodStartDateString, getTodayDateString, periodLabel, type Period } from '@/lib/date';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';
import type { SaleWithDevice } from '@/lib/types';

const PERIODS: readonly Period[] = ['Today', 'Week', 'Month'];

function formatSectionTitle(dateStr: string): string {
  const todayStr = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return formatShortDate(dateStr);
}

function groupByDay(sales: SaleWithDevice[]): { title: string; data: SaleWithDevice[] }[] {
  const map = new Map<string, SaleWithDevice[]>();
  for (const sale of sales) {
    const list = map.get(sale.date_of_sale) ?? [];
    list.push(sale);
    map.set(sale.date_of_sale, list);
  }
  return Array.from(map.entries()).map(([date, data]) => ({ title: formatSectionTitle(date), data }));
}

export default function SalesScreen() {
  const { colors } = useAppTheme();
  const { sales, refresh } = useOffline();
  const [period, setPeriod] = useState<Period>('Today');

  function handlePeriodChange(next: Period) {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    setPeriod(next);
  }

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const today = getTodayDateString();
  const periodStart = getPeriodStartDateString(period);
  const periodSales = sales.filter((sale) => sale.date_of_sale >= periodStart);
  const periodTotal = periodSales.reduce((sum, sale) => sum + sale.selling_price, 0);
  const periodProfit = periodSales.reduce(
    (sum, sale) => sum + (sale.inventory ? sale.selling_price - sale.inventory.cost_price : 0),
    0
  );
  const periodCash = periodSales
    .filter((sale) => sale.payment_method === 'Cash')
    .reduce((sum, sale) => sum + sale.selling_price, 0);
  const sections = groupByDay(periodSales);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="eyebrow" color="inkFaint">
          Today · {formatShortDate(today)}
        </ThemedText>
        <ThemedText type="heading" style={styles.heading}>
          Sales
        </ThemedText>

        <View style={styles.hero}>
          <ThemedText type="eyebrow" color="inkFaint">
            Sales {periodLabel(period)}
          </ThemedText>
          <Money amount={periodTotal} type="figureLarge" />
        </View>

        <View style={styles.periodWrap}>
          <SegmentedControl options={PERIODS} value={period} onChange={handlePeriodChange} />
        </View>

        <StatRow>
          <Stat label="Tickets" first>
            <ThemedText type="figureMedium">{periodSales.length}</ThemedText>
          </Stat>
          <Stat label="Profit">
            <Money amount={periodProfit} type="figureMedium" color="accentText" />
          </Stat>
          <Stat label="Cash">
            <Money amount={periodCash} type="figureMedium" color="amber" />
          </Stat>
        </StatRow>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="eyebrow" color="inkFaint">
                {section.title}
              </ThemedText>
            </ThemedView>
          )}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.rule }]} />}
          renderItem={({ item, index }) => <SaleRow sale={item} index={index} />}
          ListEmptyComponent={
            <ThemedText type="body" color="inkSoft" style={styles.empty}>
              {period === 'Today' ? 'No sales yet today.' : `No sales ${periodLabel(period)}.`}
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
  periodWrap: { marginBottom: Spacing.three },
  listContent: { paddingBottom: Spacing.five },
  sectionHeader: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  separator: { height: 1 },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
