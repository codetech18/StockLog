import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/lib/theme-context';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export type PinPadHandle = {
  clear: () => void;
};

type PinPadProps = {
  onComplete: (pin: string) => void;
};

export const PinPad = forwardRef<PinPadHandle, PinPadProps>(function PinPad({ onComplete }, ref) {
  const { colors } = useAppTheme();
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    clear: () => setValue(''),
  }));

  function handleKeyPress(key: string) {
    void Haptics.selectionAsync();
    if (key === 'delete') {
      setValue((prev) => prev.slice(0, -1));
      return;
    }
    if (value.length >= PIN_LENGTH) return;
    const next = value + key;
    setValue(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
    }
  }

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                borderColor: colors.ruleStrong,
                backgroundColor: index < value.length ? colors.ink : 'transparent',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {KEYS.map((key, index) => {
          if (key === '') {
            return <View key={index} style={styles.key} />;
          }
          return (
            <Pressable
              key={index}
              onPress={() => handleKeyPress(key)}
              style={({ pressed }) => [styles.key, pressed && styles.pressed]}
            >
              {key === 'delete' ? (
                <Ionicons name="backspace-outline" size={24} color={colors.ink} />
              ) : (
                <ThemedText type="heading" style={styles.keyLabel}>
                  {key}
                </ThemedText>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 18, justifyContent: 'center', marginBottom: 40 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 264,
    justifyContent: 'center',
  },
  key: {
    width: 88,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pressed: { opacity: 0.5 },
  keyLabel: { fontSize: 28 },
});
