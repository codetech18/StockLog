import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

export function StatRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function Stat({ label, children, first = false }: { label: string; children: ReactNode; first?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stat, !first && [styles.statDivided, { borderLeftColor: colors.rule }]]}>
      <ThemedText type="statLabel" color="inkFaint">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  stat: { flex: 1, gap: Spacing.half },
  statDivided: {
    borderLeftWidth: 1,
    paddingLeft: Spacing.three,
  },
});
