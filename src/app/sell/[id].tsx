import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { Tag, conditionTagVariant } from '@/components/tag';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { maskImei } from '@/lib/imei';
import { useOffline } from '@/lib/offline-context';
import type { PaymentMethod } from '@/lib/types';

const PAYMENT_METHODS: readonly PaymentMethod[] = ['Cash', 'Transfer'];

export default function SellScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory, recordSale } = useOffline();
  const item = inventory.find((candidate) => candidate.id === id) ?? null;
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [sellingPrice, setSellingPrice] = useState(item ? String(item.selling_price) : '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    const price = Number.parseInt(sellingPrice, 10);
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid selling price.');
      return;
    }

    setIsSubmitting(true);
    const { error: rpcError } = await recordSale({
      inventory_id: id,
      buyer_name: buyerName.trim() || null,
      buyer_phone: buyerPhone.trim() || null,
      selling_price: price,
      payment_method: paymentMethod,
    });
    setIsSubmitting(false);

    if (rpcError) {
      setError(rpcError);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="body" color="clay">
            {error ?? 'Device not found.'}
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
              Record sale
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              {item.device_name}
            </ThemedText>
            <View style={styles.contextRow}>
              <Tag label={item.condition} variant={conditionTagVariant(item.condition)} />
              <ThemedText type="label" color="inkFaint">
                {item.imei ? maskImei(item.imei) : 'No IMEI'}
              </ThemedText>
            </View>

            <TextField label="Buyer name (optional)" value={buyerName} onChangeText={setBuyerName} />
            <TextField
              label="Buyer phone (optional)"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              keyboardType="phone-pad"
            />

            <ThemedView style={styles.fieldGroup}>
              <ThemedText type="eyebrow" color="inkFaint">
                Payment method
              </ThemedText>
              <SegmentedControl options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
            </ThemedView>

            <TextField
              label="Selling price"
              prefix="₦"
              value={sellingPrice}
              onChangeText={(v) => setSellingPrice(v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              accent
            />

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Record sale"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.button}
            />
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
  contextRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldGroup: { gap: Spacing.two },
  button: { marginTop: Spacing.two },
});
