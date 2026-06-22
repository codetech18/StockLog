import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function ShopProfileScreen() {
  const { shop, updateShop } = useAuth();
  const [shopName, setShopName] = useState(shop?.shop_name ?? '');
  const [ownerName, setOwnerName] = useState(shop?.owner_name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!shopName.trim()) {
      setError('Enter your shop name to continue.');
      return;
    }

    setIsSubmitting(true);
    const result = await updateShop(shopName.trim(), ownerName.trim());
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
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
              Shop
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              Shop profile
            </ThemedText>

            <TextField label="Shop name" value={shopName} onChangeText={setShopName} autoCapitalize="words" accent />
            <TextField label="Owner name (optional)" value={ownerName} onChangeText={setOwnerName} autoCapitalize="words" />

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton label="Save changes" loading={isSubmitting} onPress={handleSubmit} style={styles.button} />
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
  button: { marginTop: Spacing.two },
});
