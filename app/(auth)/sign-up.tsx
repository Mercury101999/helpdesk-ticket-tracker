import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button, C, Field, s } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { isValidEmail } from '@/lib/validation';

export default function SignUp() {
  const { signUp, demoMode } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (name.trim().length < 2) return setError('Enter your full name.');
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    setError(undefined);
    try {
      await signUp(name.trim(), email.trim(), password);
      if (!demoMode) setNotice('Account created. Check your email to confirm, then sign in.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 24, maxWidth: 440, width: '100%', alignSelf: 'center' }}>
      <Text style={[s.h1, { marginTop: 32 }]}>Create account</Text>
      <Text style={[s.muted, { marginBottom: 24 }]}>New accounts start as requesters. An admin can promote technicians.</Text>
      <Field label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@company.com" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />
      {error ? <Text style={[s.error, { marginBottom: 12 }]}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#16a34a', marginBottom: 12 }}>{notice}</Text> : null}
      <Button title={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={busy} />
      <Link href="/sign-in" style={{ color: C.primary, textAlign: 'center', marginTop: 16 }}>
        Already have an account? Sign in
      </Link>
    </ScrollView>
  );
}
