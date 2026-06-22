import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad, type PinPadHandle } from '@/components/pin-pad';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePin } from '@/lib/pin-context';

export default function SetPinScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isDisableMode = mode === 'disable';
  const { setPin, clearPin, unlock } = usePin();

  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<PinPadHandle>(null);

  async function handleDisableComplete(pin: string) {
    const ok = await unlock(pin);
    if (!ok) {
      setError("That PIN's not right. Try again.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      inputRef.current?.clear();
      return;
    }
    await clearPin();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleEnterComplete(pin: string) {
    setError(null);
    setFirstPin(pin);
    setStage('confirm');
  }

  async function handleConfirmComplete(pin: string) {
    if (pin !== firstPin) {
      setError("Those didn't match. Start over.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFirstPin('');
      setStage('enter');
      return;
    }
    await setPin(pin);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const heading = isDisableMode
    ? 'Enter your PIN to turn off the lock'
    : stage === 'enter'
      ? 'Choose a 4-digit PIN'
      : 'Confirm your PIN';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <ThemedText type="body" color="inkFaint">
            Cancel
          </ThemedText>
        </Pressable>

        <View style={styles.center}>
          <ThemedText type="eyebrow" color="inkFaint">
            Security
          </ThemedText>
          <ThemedText type="heading" style={styles.heading}>
            {heading}
          </ThemedText>
          <View style={styles.inputWrap}>
            {isDisableMode ? (
              <PinPad ref={inputRef} onComplete={handleDisableComplete} />
            ) : (
              <PinPad
                key={stage}
                ref={inputRef}
                onComplete={stage === 'enter' ? handleEnterComplete : handleConfirmComplete}
              />
            )}
          </View>
          {error ? (
            <ThemedText type="label" color="clay" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  cancel: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { marginTop: Spacing.one, marginBottom: Spacing.five, textAlign: 'center' },
  inputWrap: { marginBottom: Spacing.three },
  error: { marginTop: Spacing.one },
});
