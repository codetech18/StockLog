import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

// Splash-only palette — an inversion of the app theme, used nowhere else in the app.
const SPLASH = {
  field: '#137A5C',
  mark: '#FAF9F6',
  mint: '#A8D7C6',
  hairline: '#2C8E6E',
};

export function BootSplash() {
  return (
    <View style={styles.field}>
      <View style={styles.center}>
        <View style={styles.mark}>
          <Ionicons name="reader-outline" size={52} color={SPLASH.field} />
        </View>
        <Text style={styles.wordmark}>StockLog</Text>
        <Text style={styles.tagline}>INVENTORY LEDGER</Text>
        <View style={styles.hairline} />
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>
          <View style={[styles.dot, { opacity: 1 }]} />
          <View style={[styles.dot, { opacity: 0.6 }]} />
          <View style={[styles.dot, { opacity: 0.3 }]} />
        </View>
        <Text style={styles.footerText}>Computer Village · Lagos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    backgroundColor: SPLASH.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', gap: 14 },
  mark: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: SPLASH.mark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  wordmark: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 36,
    color: SPLASH.mark,
  },
  tagline: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    letterSpacing: 3.08,
    color: SPLASH.mint,
  },
  hairline: {
    width: 44,
    height: 1,
    backgroundColor: SPLASH.hairline,
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    gap: 10,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SPLASH.mark,
  },
  footerText: {
    fontFamily: Fonts.mono.regular,
    fontSize: 11,
    color: SPLASH.mint,
  },
});
