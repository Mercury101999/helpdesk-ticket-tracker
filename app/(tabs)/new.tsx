import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Button, Chip, Field } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { errorMessage } from '@/lib/errors';
import { CATEGORIES, label, NewTicketInput, PRIORITIES } from '@/lib/types';
import { TicketErrors, validateTicket } from '@/lib/validation';

const EMPTY: NewTicketInput = { title: '', description: '', category: 'hardware', priority: 'medium' };

export default function NewTicket() {
  const { createTicket } = useData();
  const { c, s, priority: priorityTone } = useTheme();
  const [form, setForm] = useState<NewTicketInput>(EMPTY);
  const [errors, setErrors] = useState<TicketErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof NewTicketInput>(key: K, value: NewTicketInput[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (tried) setErrors(validateTicket(next));
  }

  async function submit() {
    setTried(true);
    const nextErrors = validateTicket(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    setSubmitError(undefined);
    try {
      const ticket = await createTicket(form);
      setForm(EMPTY);
      setTried(false);
      router.push({ pathname: '/ticket/[id]', params: { id: String(ticket.id) } });
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const invalid = Object.keys(errors).length > 0;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
        <Text style={[s.h1, { marginBottom: 4 }]}>Submit a ticket</Text>
        <Text style={[s.muted, { marginBottom: 16 }]}>Describe the problem and the IT team will pick it up.</Text>
        <Field
          label="Title"
          value={form.title}
          onChangeText={(v) => update('title', v)}
          placeholder="e.g. Outlook keeps asking for password"
          error={errors.title}
          hint={`${form.title.trim().length}/120`}
          maxLength={120}
          returnKeyType="next"
        />
        <Field
          label="Description"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          multiline
          placeholder="What happened, when it started, what you already tried, device or asset tag…"
          error={errors.description}
        />
        <Text style={s.fieldLabel}>Category</Text>
        <View style={[s.row, { marginBottom: errors.category ? 4 : 14 }]}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              text={category}
              active={form.category === category}
              onPress={() => update('category', category)}
              accessibilityLabel={`Category: ${label(category)}`}
            />
          ))}
        </View>
        {errors.category ? <Text style={[s.error, { marginBottom: 14 }]} accessibilityRole="alert">{errors.category}</Text> : null}
        <Text style={s.fieldLabel}>Priority</Text>
        <View style={[s.row, { marginBottom: errors.priority ? 4 : 8 }]}>
          {PRIORITIES.map((priority) => (
            <Chip
              key={priority}
              text={priority}
              active={form.priority === priority}
              onPress={() => update('priority', priority)}
              tone={priorityTone[priority]}
              accessibilityLabel={`Priority: ${label(priority)}`}
            />
          ))}
        </View>
        {errors.priority ? <Text style={[s.error, { marginBottom: 8 }]} accessibilityRole="alert">{errors.priority}</Text> : null}
        <Text style={[s.muted, { marginBottom: 16 }]}>Urgent means work is fully blocked for you or your team.</Text>
        {submitError ? (
          <Text style={[s.error, { marginBottom: 12 }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {submitError}
          </Text>
        ) : null}
        <Button title={busy ? 'Submitting…' : 'Submit ticket'} onPress={submit} disabled={busy} />
        <Text style={[s.muted, { marginTop: 10, color: invalid ? c.danger : c.muted }]} accessibilityLiveRegion="polite">
          {invalid ? 'Please fix the highlighted fields.' : 'A technician will see this in the shared queue.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
