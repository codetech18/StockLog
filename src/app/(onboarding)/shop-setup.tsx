import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function ShopSetupScreen() {
  const { createShop } = useAuth();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!shopName.trim()) {
      setError('Enter your shop name to continue.');
      return;
    }

    setIsSubmitting(true);
    const result = await createShop(shopName.trim(), ownerName.trim());
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safeArea}>
            <BrandMark />
            <ThemedText type="eyebrow" color="inkFaint">
              One last step
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              Set up your shop
            </ThemedText>
            <ThemedText type="body" color="inkSoft" style={styles.subtitle}>
              This is what shows up on your ledger. You can change it later.
            </ThemedText>

            <TextField
              label="Shop name"
              value={shopName}
              onChangeText={setShopName}
              autoCapitalize="words"
              accent
            />
            <TextField label="Owner name (optional)" value={ownerName} onChangeText={setOwnerName} autoCapitalize="words" />

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton label="Create shop" loading={isSubmitting} onPress={handleSubmit} style={styles.button} />
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
    gap: Spacing.three,
  },
  heading: { marginTop: Spacing.one },
  subtitle: { marginBottom: Spacing.two },
  button: { marginTop: Spacing.two },
});
