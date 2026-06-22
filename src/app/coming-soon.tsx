import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function ComingSoonScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <ThemedText type="body" color="inkFaint">
            Close
          </ThemedText>
        </Pressable>

        <ThemedText type="eyebrow" color="inkFaint">
          Coming soon
        </ThemedText>
        <ThemedText type="heading" style={styles.heading}>
          {title}
        </ThemedText>
        <ThemedText type="body" color="inkSoft">
          This isn&apos;t built yet — it&apos;ll land in a future update.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  cancel: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  heading: { marginTop: Spacing.one },
});
