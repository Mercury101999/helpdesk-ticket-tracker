import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, type TextInputInstance } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Button, Field, focusField } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { errorMessage } from '@/lib/errors';
import { AuthErrors, validateSignIn } from '@/lib/validation';

export default function SignIn() {
  const { signIn, demoSignIn, demoMode } = useData();
  const { s } = useTheme();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = validateSignIn(email, password);
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.authContent} keyboardShouldPersistTaps="handled">
        <Text style={[s.h1, { marginTop: 32 }]}>IT Help Desk</Text>
        <Text style={[s.muted, { marginBottom: 24 }]}>Sign in to submit and track support tickets.</Text>
        <Field
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@company.com"
          error={errors.email}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => focusField(passwordRef)}
        />
        <Field
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          autoComplete="current-password"
          textContentType="password"
          secureTextEntry
          placeholder="••••••••"
          error={errors.password}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {formError ? (
          <Text style={[s.error, { marginBottom: 12 }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
        <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} />
        <Link href="/sign-up" style={s.link}>
          No account? Create one
        </Link>

        {demoMode && (
          <View style={[s.card, { marginTop: 28 }]}>
            <Text style={s.h2}>Demo mode: continue as…</Text>
            <Text style={[s.muted, { marginBottom: 12 }]}>
              No Supabase keys are configured, so the app uses local mock data. Pick a role to explore its permissions.
            </Text>
            <View style={{ gap: 8 }}>
              <Button variant="outline" title="Requester (Alex, Finance)" onPress={() => demoSignIn('requester')} />
              <Button variant="outline" title="Technician (Sam, IT)" onPress={() => demoSignIn('technician')} />
              <Button variant="outline" title="Admin (Jordan, IT)" onPress={() => demoSignIn('admin')} />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
