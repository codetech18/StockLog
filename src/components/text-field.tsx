import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  accent?: boolean;
  prefix?: string;
  labelRight?: ReactNode;
};

export function TextField({ label, error, accent, prefix, labelRight, style, ...inputProps }: TextFieldProps) {
  const { colors } = useAppTheme();
  const borderColor = accent ? colors.accent : colors.ruleStrong;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <ThemedText type="eyebrow" color="inkFaint">
          {label}
        </ThemedText>
        {labelRight}
      </View>
      {prefix ? (
        <View style={[styles.prefixRow, { borderBottomColor: borderColor }]}>
          {/* No custom fontFamily here — ₦ doesn't render reliably in either custom font on a native build. */}
          <ThemedText type="body" color="inkSoft" style={styles.prefix}>
            {prefix}
          </ThemedText>
          <TextInput
            style={[styles.input, { color: colors.ink }, styles.inputInRow, style]}
            placeholderTextColor={colors.inkFaint}
            {...inputProps}
          />
        </View>
      ) : (
        <TextInput
          style={[styles.input, { color: colors.ink, borderBottomColor: borderColor }, style]}
          placeholderTextColor={colors.inkFaint}
          {...inputProps}
        />
      )}
      {error ? (
        <ThemedText type="label" color="clay">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    borderBottomWidth: 1.5,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  inputInRow: {
    flex: 1,
    borderBottomWidth: 0,
    paddingVertical: 0,
    minHeight: undefined,
  },
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderBottomWidth: 1.5,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  prefix: {
    fontFamily: undefined,
    fontWeight: '700',
  },
});
