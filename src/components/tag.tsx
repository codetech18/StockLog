import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, type ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';
import type { Condition } from '@/lib/types';

export type TagVariant = 'new' | 'ukUsed' | 'ngUsed' | 'sold';

const TAG_COLORS: Record<TagVariant, { bg: ColorToken; fg: ColorToken }> = {
  new: { bg: 'accentSoft', fg: 'accentText' },
  ukUsed: { bg: 'amberSoft', fg: 'amber' },
  ngUsed: { bg: 'rule', fg: 'inkSoft' },
  sold: { bg: 'claySoft', fg: 'clay' },
};

export function conditionTagVariant(condition: Condition): TagVariant {
  if (condition === 'New') return 'new';
  if (condition === 'UK Used') return 'ukUsed';
  return 'ngUsed';
}

export function Tag({ label, variant }: { label: string; variant: TagVariant }) {
  const { colors } = useAppTheme();
  const { bg, fg } = TAG_COLORS[variant];

  return (
    <View style={[styles.tag, { backgroundColor: colors[bg] }]}>
      <ThemedText color={fg} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: Radius.tag,
  },
  label: {
    fontFamily: Fonts.sans.bold,
    fontSize: 10.5,
    lineHeight: 13,
  },
});
