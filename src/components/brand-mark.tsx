import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/lib/theme-context';

// The same mark used on the splash screen and app icon, scaled down — ties the
// auth screens back to the app's identity instead of being plain text on paper.
export function BrandMark() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.mark, { backgroundColor: colors.accent }]}>
      <Ionicons name="reader-outline" size={28} color={colors.onAccent} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
