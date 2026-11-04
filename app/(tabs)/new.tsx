import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, C, Chip, Field, PRIORITY_COLORS, s } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { CATEGORIES, NewTicketInput, PRIORITIES } from '@/lib/types';
import { TicketErrors, validateTicket } from '@/lib/validation';

const EMPTY: NewTicketInput = { title: '', description: '', category: 'hardware', priority: 'medium' };

export default function NewTicket() {
  const { createTicket } = useData();
  const [form, setForm] = useState<NewTicketInput>(EMPTY);
  const [errors, setErrors] = useState<TicketErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof NewTicketInput>(k: K, v: NewTicketInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    const errs = validateTicket(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setSubmitError(undefined);
    try {
      const ticket = await createTicket(form);
      setForm(EMPTY);
      router.push({ pathname: '/ticket/[id]', params: { id: String(ticket.id) } });
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Text style={[s.h1, { marginBottom: 4 }]}>Submit a ticket</Text>
      <Text style={[s.muted, { marginBottom: 16 }]}>Describe the problem and the IT team will pick it up.</Text>
      <Field label="Title" value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. Outlook keeps asking for password" error={errors.title} maxLength={120} />
      <Field label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline
        placeholder="What happened, when it started, what you already tried, device/asset tag…" error={errors.description} />
      <Text style={s.fieldLabel}>Category</Text>
      <View style={[s.row, { marginBottom: 14 }]}>
        {CATEGORIES.map((c) => <Chip key={c} text={c} active={form.category === c} onPress={() => set('category', c)} />)}
      </View>
      <Text style={s.fieldLabel}>Priority</Text>
      <View style={[s.row, { marginBottom: 20 }]}>
        {PRIORITIES.map((p) => <Chip key={p} text={p} active={form.priority === p} onPress={() => set('priority', p)} color={PRIORITY_COLORS[p]} />)}
      </View>
      {submitError ? <Text style={[s.error, { marginBottom: 12 }]}>{submitError}</Text> : null}
      <Button title={busy ? 'Submitting…' : 'Submit ticket'} onPress={submit} disabled={busy} />
      <Text style={[s.muted, { marginTop: 10, color: Object.keys(errors).length ? C.danger : C.muted }]}>
        {Object.keys(errors).length ? 'Please fix the highlighted fields.' : 'Urgent = work fully blocked for you or your team.'}
      </Text>
    </ScrollView>
  );
}
