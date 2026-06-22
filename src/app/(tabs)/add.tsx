import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Money } from '@/components/money';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { isValidImei } from '@/lib/imei';
import { useOffline } from '@/lib/offline-context';
import { useAppTheme } from '@/lib/theme-context';
import type { Condition } from '@/lib/types';

const CONDITIONS: readonly Condition[] = ['New', 'UK Used', 'NG Used'];

const emptyForm = {
  deviceName: '',
  brand: '',
  storage: '',
  color: '',
  imei: '',
  costPrice: '',
  sellingPrice: '',
};

export default function AddScreen() {
  const { colors } = useAppTheme();
  const { shop } = useAuth();
  const { addInventory } = useOffline();
  const [form, setForm] = useState(emptyForm);
  const [condition, setCondition] = useState<Condition>('New');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleScan() {
    void Haptics.selectionAsync();
    Alert.alert('Scan coming soon', "IMEI barcode scanning isn't wired up yet — type the IMEI in for now.");
  }

  const costNum = Number.parseInt(form.costPrice, 10);
  const sellNum = Number.parseInt(form.sellingPrice, 10);
  const showMargin = form.costPrice.length > 0 && form.sellingPrice.length > 0;
  const margin = Number.isFinite(costNum) && Number.isFinite(sellNum) ? sellNum - costNum : 0;

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!shop) {
      setError('Your shop isn’t set up yet.');
      return;
    }
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
    const { error: insertError, queued } = await addInventory({
      shop_id: shop.id,
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

    if (insertError) {
      setError(insertError);
      return;
    }

    setForm(emptyForm);
    setCondition('New');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSuccess(queued ? "Device logged. Will sync once you're back online." : 'Device logged.');
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safeArea}>
            <ThemedText type="eyebrow" color="inkFaint">
              Add
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              Log a device
            </ThemedText>
            <ThemedText type="body" color="inkFaint">
              Record stock as it comes in.
            </ThemedText>

            <TextField label="Device name" value={form.deviceName} onChangeText={(v) => update('deviceName', v)} />
            <TextField label="Brand" value={form.brand} onChangeText={(v) => update('brand', v)} accent />
            <TextField
              label="IMEI (optional)"
              value={form.imei}
              onChangeText={(v) => update('imei', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={15}
              labelRight={
                <Pressable style={styles.scan} onPress={handleScan} hitSlop={8}>
                  <Ionicons name="barcode-outline" size={13} color={colors.accent} />
                  <ThemedText type="eyebrow" color="accentText">
                    Scan
                  </ThemedText>
                </Pressable>
              }
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
            {success ? (
              <ThemedText type="label" color="accentText">
                {success}
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

            <PrimaryButton label="Log device" loading={isSubmitting} onPress={handleSubmit} style={styles.button} />
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
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  heading: { marginTop: Spacing.one },
  fieldRow: { flexDirection: 'row', gap: Spacing.three },
  fieldHalf: { flex: 1 },
  fieldGroup: { gap: Spacing.two },
  scan: { flexDirection: 'row', alignItems: 'center', gap: Spacing.half },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  button: { marginTop: Spacing.two },
});
