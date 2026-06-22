import { Text, type TextProps } from 'react-native';

import { type ColorToken, Type } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme-context';

export type ThemedTextProps = TextProps & {
  type?: keyof typeof Type;
  color?: ColorToken;
};

export function ThemedText({ style, type = 'body', color = 'ink', ...rest }: ThemedTextProps) {
  const { colors } = useAppTheme();
  return <Text style={[Type[type], { color: colors[color] }, style]} {...rest} />;
}
