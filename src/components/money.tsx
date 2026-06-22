import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type ColorToken } from '@/constants/theme';
import { formatAmount } from '@/lib/money';

type MoneyType = 'figure' | 'figureMedium' | 'figureLarge';

type MoneyProps = {
  amount: number;
  type?: MoneyType;
  color?: ColorToken;
  // Per DESIGN.md: "Money out shows a minus in clay with tabular mono."
  negative?: boolean;
};

// Neither of our custom fonts draws ₦ legibly: Space Mono's own glyph for it
// reads as "#", and Space Grotesk's glyph — present in the source .ttf, confirmed
// via font inspection — doesn't make it into this build's linked font at all, so
// Core Text silently substitutes Space Mono's "#"-like glyph for it anyway. The
// platform's own system font draws it correctly, so the symbol deliberately gets
// no custom fontFamily — overriding back to undefined to clear the inherited mono.
export function Money({ amount, type = 'figure', color = 'ink', negative = false }: MoneyProps) {
  // Neutral (ink) figures render the ₦ symbol in the quiet "lineNumber" tone so the
  // digits themselves form a saturated column; semantic colors (clay/accent/amber)
  // apply uniformly across symbol + digits.
  const symbolColor = color === 'ink' ? 'lineNumber' : color;

  return (
    <View style={styles.row}>
      {negative ? <ThemedText type={type} color={color}>−</ThemedText> : null}
      <ThemedText type={type} color={symbolColor} style={{ fontFamily: undefined }}>
        ₦
      </ThemedText>
      <ThemedText type={type} color={color}>
        {formatAmount(amount)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
