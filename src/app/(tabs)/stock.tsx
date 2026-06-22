import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, LayoutAnimation, Pressable, TextInput, UIManager, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterTabs } from '@/components/filter-tabs';
import { Money } from '@/components/money';
import { Tag, conditionTagVariant } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { formatShortDate } from '@/lib/date';
import { maskImei } from '@/lib/imei';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';
import type { Inventory } from '@/lib/types';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StockScreen() {
  const { colors } = useAppTheme();
  const { inventory: items, refresh, restoreSale } = useOffline();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const listRef = useRef<FlatList>(null);

  function animateListChange() {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  }

  function handleSearchChange(text: string) {
    animateListChange();
    setSearch(text);
  }

  function handleFilterChange(next: string) {
    animateListChange();
    setFilter(next);
  }

  function handleRowPress(item: Inventory) {
    if (item.status === 'sold') {
      Alert.alert(item.device_name, 'Customer returned this device?', [
        { text: 'Restore to stock', onPress: () => handleRestore(item) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    Alert.alert(item.device_name, undefined, [
      { text: 'Record sale', onPress: () => router.push(`/sell/${item.id}`) },
      { text: 'Edit details', onPress: () => router.push(`/edit/${item.id}`) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleRestore(item: Inventory) {
    const { error } = await restoreSale(item.id);
    if (error) {
      Alert.alert("Couldn't restore", error);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  useFocusEffect(
    useCallback(() => {
      void refresh();
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [refresh])
  );

  const brands = useMemo(
    () => ['All', ...Array.from(new Set(items.map((item) => item.brand).filter((b): b is string => Boolean(b))))],
    [items]
  );

  const inStockCount = items.filter((item) => item.status === 'in_stock').length;
  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesFilter = filter === 'All' || item.brand === filter;
    const matchesSearch = !query || item.device_name.toLowerCase().includes(query) || (item.imei?.includes(query) ?? false);
    return matchesFilter && matchesSearch;
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="eyebrow" color="inkFaint">
          In stock
        </ThemedText>
        <View style={styles.headerRow}>
          <ThemedText type="heading">Stock</ThemedText>
          <ThemedText type="label" color="inkFaint">
            {inStockCount} units
          </ThemedText>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.ruleStrong }]}>
          <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
          <TextInput
            style={[styles.searchInput, { color: colors.ink }]}
            placeholder="Search device or IMEI"
            placeholderTextColor={colors.inkFaint}
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterTabsWrap}>
          <FilterTabs options={brands} value={filter} onChange={handleFilterChange} />
        </View>

        <View style={[styles.columnHeader, { borderBottomColor: colors.rule }]}>
          <ThemedText type="eyebrow" color="inkFaint">
            Device
          </ThemedText>
          <ThemedText type="eyebrow" color="inkFaint">
            Price
          </ThemedText>
        </View>

        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.rule }]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const sold = item.status === 'sold';
            return (
              <Pressable
                style={({ pressed }) => [styles.row, sold && styles.rowSold, pressed && styles.rowPressed]}
                onPress={() => handleRowPress(item)}
              >
                <ThemedText type="metaMono" color="lineNumber" style={styles.lineNumber}>
                  {String(index + 1).padStart(2, '0')}
                </ThemedText>
                <View style={styles.rowMain}>
                  <View style={styles.nameRow}>
                    <ThemedText type="rowPrimary">{item.device_name}</ThemedText>
                    {sold ? (
                      <Tag label="Sold" variant="sold" />
                    ) : (
                      <Tag label={item.condition} variant={conditionTagVariant(item.condition)} />
                    )}
                  </View>
                  <ThemedText type="metaMono" color="inkFaint">
                    {item.imei ? `IMEI ${maskImei(item.imei)}` : 'No IMEI'}
                  </ThemedText>
                </View>
                <View style={styles.rowFigures}>
                  <Money amount={item.selling_price} type="figure" />
                  <ThemedText type="metaMono" color="inkFaint">
                    {formatShortDate(item.date_of_entry)}
                  </ThemedText>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedText type="body" color="inkSoft" style={styles.empty}>
              {items.length === 0 ? 'No devices logged yet. Tap + to add your first.' : 'No devices match your search.'}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
  },
  filterTabsWrap: { marginBottom: Spacing.two },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
  },
  listContent: { paddingTop: Spacing.three, paddingBottom: Spacing.five },
  separator: { height: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    gap: Spacing.two,
  },
  rowSold: { opacity: 0.5 },
  rowPressed: { opacity: 0.6 },
  lineNumber: { width: 16, paddingTop: 2 },
  rowMain: { flex: 1, gap: Spacing.half },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowFigures: { alignItems: 'flex-end', gap: Spacing.half },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
