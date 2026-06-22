import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { PasswordVisibilityToggle } from '@/components/password-visibility-toggle';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

function describeSignInError(message: string): string {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return "That email and password don't match. Check them and try again.";
  }
  return message;
}

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(describeSignInError(result.error));
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safeArea}>
            <BrandMark />
            <ThemedText type="eyebrow" color="inkFaint">
              Welcome back
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              Log in
            </ThemedText>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <View style={styles.passwordField}>
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                accent
                labelRight={
                  <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                }
              />
              <Link href="/forgot-password" asChild>
                <Pressable style={styles.forgotLink}>
                  <ThemedText type="label" color="inkFaint">
                    Forgot password?
                  </ThemedText>
                </Pressable>
              </Link>
            </View>

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton label="Log in" loading={isSubmitting} onPress={handleSubmit} style={styles.button} />

            <Link href="/sign-up" asChild>
              <Pressable style={styles.link}>
                <ThemedText type="body" color="accentText">
                  New here? Create an account
                </ThemedText>
              </Pressable>
            </Link>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
  heading: { marginTop: Spacing.one, marginBottom: Spacing.two },
  passwordField: { gap: Spacing.one },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: Spacing.one },
  button: { marginTop: Spacing.two },
  link: { alignSelf: 'center', marginTop: Spacing.three, padding: Spacing.two },
});
