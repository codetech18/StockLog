import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad, type PinPadHandle } from '@/components/pin-pad';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePin } from '@/lib/pin-context';

export function PinLockScreen() {
  const { unlock } = usePin();
  const [error, setError] = useState(false);
  const inputRef = useRef<PinPadHandle>(null);

  async function handleComplete(pin: string) {
    const ok = await unlock(pin);
    if (!ok) {
      setError(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      inputRef.current?.clear();
      return;
    }
    setError(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ThemedText type="eyebrow" color="inkFaint">
            Locked
          </ThemedText>
          <ThemedText type="heading" style={styles.heading}>
            Enter your PIN
          </ThemedText>
          <View style={styles.inputWrap}>
            <PinPad ref={inputRef} onComplete={handleComplete} />
          </View>
          {error ? (
            <ThemedText type="label" color="clay" style={styles.error}>
              Wrong PIN. Try again.
            </ThemedText>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  center: { alignItems: 'center' },
  heading: { marginTop: Spacing.one, marginBottom: Spacing.five },
  inputWrap: { marginBottom: Spacing.three },
  error: { marginTop: Spacing.one },
});
