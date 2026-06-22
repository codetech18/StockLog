import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type GestureResponderEvent, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
};

export function PrimaryButton({ label, loading, disabled, style, onPress, ...pressableProps }: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  function handlePress(event: GestureResponderEvent) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  }

  return (
    <Pressable
      disabled={isDisabled}
      onPress={handlePress}
      style={(state) => [
        styles.button,
        { backgroundColor: colors.accent },
        isDisabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <ThemedText type="body" color="onAccent" style={styles.label}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.button,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: Fonts.sans.bold,
    fontSize: 16,
  },
});
