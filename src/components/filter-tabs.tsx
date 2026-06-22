/* eslint-disable react-hooks/refs -- classic Animated.Value is a deliberate ref-based escape hatch from React's render cycle */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Radius, Spacing, Type } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

type FilterTabsProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

function Chip<T extends string>({ option, isActive, onPress }: { option: T; isActive: boolean; onPress: () => void }) {
  'use no memo'; // classic Animated.Value is a deliberate ref-based escape hatch from React's render cycle
  const { colors } = useAppTheme();
  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: isActive ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [isActive, progress]);

  const backgroundColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.surface, colors.accent] });
  const borderColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.ruleStrong, colors.accent] });
  const textColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.ink, colors.onAccent] });

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Animated.View style={[styles.chip, { backgroundColor, borderColor, opacity: pressed ? 0.75 : 1 }]}>
          <Animated.Text style={[Type.label, { color: textColor }]}>{option}</Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

export function FilterTabs<T extends string>({ options, value, onChange }: FilterTabsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => (
        <Chip key={option} option={option} isActive={option === value} onPress={() => onChange(option)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
