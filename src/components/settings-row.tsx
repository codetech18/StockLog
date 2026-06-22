import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  destructive?: boolean;
};

export function SettingsRow({ label, value, onPress, right, destructive = false }: SettingsRowProps) {
  const { colors } = useAppTheme();
  const content = (
    <View style={[styles.row, { borderBottomColor: colors.rule }]}>
      <ThemedText type="settingsRow" color={destructive ? 'clay' : 'ink'}>
        {label}
      </ThemedText>
      <View style={styles.right}>
        {value ? (
          <ThemedText type="label" color="inkFaint">
            {value}
          </ThemedText>
        ) : null}
        {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} /> : null)}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: 0.6 },
});
