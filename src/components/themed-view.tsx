import { View, type ViewProps } from 'react-native';

import { type ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

export type ThemedViewProps = ViewProps & {
  color?: ColorToken;
};

export function ThemedView({ style, color = 'paper', ...rest }: ThemedViewProps) {
  const { colors } = useAppTheme();
  return <View style={[{ backgroundColor: colors[color] }, style]} {...rest} />;
}
