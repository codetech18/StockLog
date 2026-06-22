/* eslint-disable react-hooks/refs -- classic Animated.Value is a deliberate ref-based escape hatch from React's render cycle */
import { useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  'use no memo'; // classic Animated.Value is a deliberate ref-based escape hatch from React's render cycle
  const { colors } = useAppTheme();
  const index = options.indexOf(value);
  const translate = useRef(new Animated.Value(index)).current;
  const [groupWidth, setGroupWidth] = useState(0);
  const segmentWidth = groupWidth / options.length;

  useEffect(() => {
    Animated.timing(translate, { toValue: index, duration: 180, useNativeDriver: true }).start();
  }, [index, translate]);

  function handleLayout(event: LayoutChangeEvent) {
    setGroupWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={[styles.group, { borderColor: colors.ruleStrong }]} onLayout={handleLayout}>
      {groupWidth > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.ink,
              width: segmentWidth,
              transform: [
                {
                  translateX: translate.interpolate({
                    inputRange: options.map((_, i) => i),
                    outputRange: options.map((_, i) => i * segmentWidth),
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [styles.segment, pressed && styles.pressed]}
          >
            <ThemedText type="label" color={isActive ? 'paper' : 'ink'}>
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radius.button,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  pressed: { opacity: 0.7 },
});
