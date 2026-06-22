import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Money } from '@/components/money';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { isValidImei } from '@/lib/imei';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';
import type { Condition } from '@/lib/types';

const CONDITIONS: readonly Condition[] = ['New', 'UK Used', 'NG Used'];

export default function EditScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory, updateInventory, deleteInventory } = useOffline();
  const item = inventory.find((candidate) => candidate.id === id) ?? null;

  const [form, setForm] = useState({
    deviceName: item?.device_name ?? '',
    brand: item?.brand ?? '',
    storage: item?.storage ?? '',
    color: item?.color ?? '',
    imei: item?.imei ?? '',
    costPrice: item ? String(item.cost_price) : '',
    sellingPrice: item ? String(item.selling_price) : '',
  });
  const [condition, setCondition] = useState<Condition>(item?.condition ?? 'New');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const costNum = Number.parseInt(form.costPrice, 10);
  const sellNum = Number.parseInt(form.sellingPrice, 10);
  const showMargin = form.costPrice.length > 0 && form.sellingPrice.length > 0;
  const margin = Number.isFinite(costNum) && Number.isFinite(sellNum) ? sellNum - costNum : 0;

  async function handleSubmit() {
    setError(null);

    if (!item) return;
    if (!form.deviceName.trim()) {
      setError('Enter a device name to continue.');
      return;
    }
    if (!form.brand.trim()) {
      setError('Enter a brand to continue.');
      return;
    }
    if (!form.color.trim()) {
      setError('Enter a color to continue.');
      return;
    }
    const trimmedImei = form.imei.trim();
    if (trimmedImei && !isValidImei(trimmedImei)) {
      setError('IMEI must be exactly 15 digits.');
      return;
    }
    const costPrice = Number.parseInt(form.costPrice, 10);
    const sellingPrice = Number.parseInt(form.sellingPrice, 10);
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      setError('Enter a valid cost price.');
      return;
    }
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setError('Enter a valid selling price.');
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await updateInventory({
      id: item.id,
      device_name: form.deviceName.trim(),
      brand: form.brand.trim(),
      storage: form.storage.trim() || null,
      color: form.color.trim(),
      imei: trimmedImei || null,
      condition,
      cost_price: costPrice,
      selling_price: sellingPrice,
    });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    if (!item) return;
    void Haptics.selectionAsync();
    Alert.alert(
      'Delete this device?',
      `"${item.device_name}" will be removed from your stock. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const { error: deleteError } = await deleteInventory(item.id);
            setIsDeleting(false);
            if (deleteError) {
              setError(deleteError);
              return;
            }
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  }

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="body" color="clay">
            Device not found.
          </ThemedText>
          <Pressable onPress={() => router.back()} style={styles.cancel}>
            <ThemedText type="body" color="accentText">
              Go back
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safeArea}>
            <Pressable onPress={() => router.back()} style={styles.cancel}>
              <ThemedText type="body" color="inkFaint">
                Cancel
              </ThemedText>
            </Pressable>

            <ThemedText type="eyebrow" color="inkFaint">
              Edit entry
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              {item.device_name}
            </ThemedText>
            <ThemedText type="body" color="inkFaint">
              Fix a mistake from when this was logged.
            </ThemedText>

            <TextField label="Device name" value={form.deviceName} onChangeText={(v) => update('deviceName', v)} />
            <TextField label="Brand" value={form.brand} onChangeText={(v) => update('brand', v)} accent />
            <TextField
              label="IMEI (optional)"
              value={form.imei}
              onChangeText={(v) => update('imei', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={15}
            />

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <TextField label="Storage (optional)" value={form.storage} onChangeText={(v) => update('storage', v)} />
              </View>
              <View style={styles.fieldHalf}>
                <TextField label="Color" value={form.color} onChangeText={(v) => update('color', v)} accent />
              </View>
            </View>

            <ThemedView style={styles.fieldGroup}>
              <ThemedText type="eyebrow" color="inkFaint">
                Condition
              </ThemedText>
              <SegmentedControl options={CONDITIONS} value={condition} onChange={setCondition} />
            </ThemedView>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <TextField
                  label="Cost price"
                  prefix="₦"
                  value={form.costPrice}
                  onChangeText={(v) => update('costPrice', v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.fieldHalf}>
                <TextField
                  label="Selling price"
                  prefix="₦"
                  value={form.sellingPrice}
                  onChangeText={(v) => update('sellingPrice', v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  accent
                />
              </View>
            </View>

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            {showMargin ? (
              <View style={[styles.marginRow, { borderTopColor: colors.rule }]}>
                <ThemedText type="eyebrow" color="inkFaint">
                  Margin / unit
                </ThemedText>
                <Money amount={margin} type="figure" color="accentText" />
              </View>
            ) : null}

            <PrimaryButton
              label="Save changes"
              loading={isSubmitting}
              disabled={isDeleting}
              onPress={handleSubmit}
              style={styles.button}
            />

            <Pressable
              onPress={handleDelete}
              disabled={isSubmitting || isDeleting}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
            >
              <ThemedText type="body" color="clay">
                {isDeleting ? 'Deleting…' : 'Delete device'}
              </ThemedText>
            </Pressable>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  cancel: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  heading: { marginTop: Spacing.one },
  fieldRow: { flexDirection: 'row', gap: Spacing.three },
  fieldHalf: { flex: 1 },
  fieldGroup: { gap: Spacing.two },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  button: { marginTop: Spacing.two },
  deleteButton: { alignSelf: 'center', paddingVertical: Spacing.two },
  deletePressed: { opacity: 0.6 },
});
