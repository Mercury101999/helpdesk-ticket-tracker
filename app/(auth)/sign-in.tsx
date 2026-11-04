import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, C, Field, s } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { isValidEmail } from '@/lib/validation';

export default function SignIn() {
  const { signIn, demoSignIn, demoMode } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    setError(undefined);
    try {
      await signIn(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 24, maxWidth: 440, width: '100%', alignSelf: 'center' }}>
      <Text style={[s.h1, { marginTop: 32 }]}>IT Help Desk</Text>
      <Text style={[s.muted, { marginBottom: 24 }]}>Sign in to submit and track support tickets.</Text>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@company.com" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
      {error ? <Text style={[s.error, { marginBottom: 12 }]}>{error}</Text> : null}
      <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} />
      <Link href="/sign-up" style={{ color: C.primary, textAlign: 'center', marginTop: 16 }}>
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
  );
}
