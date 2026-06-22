import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { PasswordVisibilityToggle } from '@/components/password-visibility-toggle';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

const MIN_PASSWORD_LENGTH = 6;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Enter your email and a password to continue.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setInfo('Check your email to confirm your account, then log in below.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView style={styles.safeArea}>
            <BrandMark />
            <ThemedText type="eyebrow" color="inkFaint">
              Welcome
            </ThemedText>
            <ThemedText type="heading" style={styles.heading}>
              Create your account
            </ThemedText>
            <ThemedText type="body" color="inkSoft" style={styles.subtitle}>
              Track your stock and sales like your notebook, just faster.
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
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              accent
              labelRight={
                <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
              }
            />
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              accent
            />

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}
            {info ? (
              <ThemedText type="label" color="accentText">
                {info}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Create account"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.button}
            />

            <Link href="/sign-in" asChild>
              <Pressable style={styles.link}>
                <ThemedText type="body" color="accentText">
                  Already have an account? Log in
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
  heading: { marginTop: Spacing.one },
  subtitle: { marginBottom: Spacing.two },
  button: { marginTop: Spacing.two },
  link: { alignSelf: 'center', marginTop: Spacing.three, padding: Spacing.two },
});
