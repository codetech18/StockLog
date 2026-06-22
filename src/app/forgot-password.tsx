import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { PasswordVisibilityToggle } from '@/components/password-visibility-toggle';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const [stage, setStage] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode() {
    setError(null);

    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }

    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStage('verify');
  }

  async function handleSetNewPassword() {
    setError(null);

    if (!code.trim()) {
      setError('Enter the code from your email.');
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
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });

    if (verifyError) {
      setIsSubmitting(false);
      setError(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.cancel}
        >
          <ThemedText type="body" color="inkFaint">
            Cancel
          </ThemedText>
        </Pressable>

        <BrandMark />
        <ThemedText type="eyebrow" color="inkFaint">
          Reset password
        </ThemedText>

        {stage === 'request' ? (
          <>
            <ThemedText type="heading" style={styles.heading}>
              Forgot your password?
            </ThemedText>
            <ThemedText type="body" color="inkSoft" style={styles.subtitle}>
              Enter your email and we&apos;ll send you a code to reset your password.
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

            {error ? (
              <ThemedText type="label" color="clay">
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Send reset code"
              loading={isSubmitting}
              onPress={handleRequestCode}
              style={styles.button}
            />
          </>
        ) : (
          <>
            <ThemedText type="heading" style={styles.heading}>
              Check your email
            </ThemedText>
            <ThemedText type="body" color="inkSoft" style={styles.subtitle}>
              Enter the code we sent to {email.trim()}, then choose a new password.
            </ThemedText>

            <TextField
              label="Reset code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              accent
            />
            <TextField
              label="New password"
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
              label="Confirm new password"
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

            <PrimaryButton
              label="Save new password"
              loading={isSubmitting}
              onPress={handleSetNewPassword}
              style={styles.button}
            />

            <Pressable onPress={() => setStage('request')} style={styles.link}>
              <ThemedText type="body" color="accentText">
                Use a different email
              </ThemedText>
            </Pressable>
          </>
        )}
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
    gap: Spacing.three,
  },
  cancel: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  heading: { marginTop: Spacing.one },
  subtitle: { marginBottom: Spacing.two },
  button: { marginTop: Spacing.two },
  link: { alignSelf: 'center', marginTop: Spacing.two, padding: Spacing.two },
});
