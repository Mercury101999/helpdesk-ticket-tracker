import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, type TextInputInstance } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Button, Field, focusField } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { errorMessage } from '@/lib/errors';
import { AuthErrors, validateSignUp } from '@/lib/validation';

export default function SignUp() {
  const { signUp, demoMode } = useData();
  const { s } = useTheme();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const [formError, setFormError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = validateSignUp(name, email, password);
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      if (!demoMode) setNotice('Account created. Check your email to confirm, then sign in.');
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.authContent} keyboardShouldPersistTaps="handled">
        <Text style={[s.h1, { marginTop: 32 }]}>Create account</Text>
        <Text style={[s.muted, { marginBottom: 24 }]}>New accounts start as requesters. An admin can promote technicians.</Text>
        <Field
          label="Full name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          autoComplete="name"
          textContentType="name"
          placeholder="Jane Doe"
          error={errors.name}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => focusField(emailRef)}
        />
        <Field
          ref={emailRef}
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
          autoComplete="new-password"
          textContentType="newPassword"
          secureTextEntry
          placeholder="At least 8 characters"
          error={errors.password}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {formError ? (
          <Text style={[s.error, { marginBottom: 12 }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
        {notice ? (
          <Text style={s.success} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {notice}
          </Text>
        ) : null}
        <Button title={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={busy} />
        <Link href="/sign-in" style={s.link}>
          Already have an account? Sign in
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
