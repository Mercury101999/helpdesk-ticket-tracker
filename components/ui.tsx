import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { label, Priority, Status } from '@/lib/types';

export const C = {
  bg: '#f4f6fb',
  card: '#ffffff',
  text: '#1b2333',
  muted: '#6b7280',
  border: '#e2e6ef',
  primary: '#2563eb',
  danger: '#dc2626',
};

export const STATUS_COLORS: Record<Status, string> = {
  open: '#2563eb',
  in_progress: '#d97706',
  resolved: '#16a34a',
  closed: '#6b7280',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#64748b',
  medium: '#0891b2',
  high: '#ea580c',
  urgent: '#dc2626',
};

export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '1a', borderColor: color }]}>
      <Text style={[s.badgeText, { color }]}>{label(text)}</Text>
    </View>
  );
}

export function Chip({ text, active, onPress, color = C.primary }: { text: string; active: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: color, borderColor: color }]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label(text)}</Text>
    </Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled, style }: {
  title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'danger'; disabled?: boolean; style?: ViewStyle;
}) {
  const bg = variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.button, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        variant === 'outline' && { borderWidth: 1, borderColor: C.primary }, style]}>
      <Text style={[s.buttonText, variant === 'outline' && { color: C.primary }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label: fieldLabel, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.fieldLabel}>{fieldLabel}</Text>
      <TextInput
        placeholderTextColor="#9ca3af"
        {...props}
        style={[s.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' }, error && { borderColor: C.danger }]}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function DemoBanner() {
  return (
    <View style={s.demo}>
      <Text style={s.demoText}>DEMO MODE · local mock data, no Supabase project connected</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  h1: { fontSize: 22, fontWeight: '700', color: C.text },
  h2: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 },
  body: { fontSize: 15, color: C.text, lineHeight: 21 },
  muted: { fontSize: 13, color: C.muted },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  chip: { borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 13, color: C.text, fontWeight: '500' },
  button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, fontSize: 15, color: C.text },
  error: { color: C.danger, fontSize: 12, marginTop: 4 },
  demo: { backgroundColor: '#fef3c7', borderBottomWidth: 1, borderColor: '#f59e0b', paddingVertical: 6, paddingHorizontal: 12 },
  demoText: { color: '#92400e', fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
