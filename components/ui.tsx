import React, { forwardRef } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View, ViewStyle, type TextInputInstance } from 'react-native';

import { label } from '@/lib/types';
import { Palette, pressFeedback, Tone } from '@/lib/theme';

import { useTheme } from './ThemeProvider';

export function Badge({ text, tone }: { text: string; tone: Tone }) {
  const { s } = useTheme();
  return (
    <View style={[s.badge, { backgroundColor: tone.bg, borderColor: tone.solid }]}>
      <Text style={[s.badgeText, { color: tone.fg }]}>{label(text)}</Text>
    </View>
  );
}

export function Chip({
  text,
  active,
  onPress,
  tone,
  accessibilityLabel,
}: {
  text: string;
  active: boolean;
  onPress: () => void;
  tone?: Tone;
  accessibilityLabel?: string;
}) {
  const { c, s } = useTheme();
  const solid = tone?.solid ?? c.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label(text)}
      accessibilityState={{ selected: active }}
      aria-selected={active}
      onPress={onPress}
      style={(state) => [s.chip, active && { backgroundColor: solid, borderColor: solid }, pressFeedback(state, c)]}>
      <Text style={[s.chipText, active && { color: c.primaryText }]}>{label(text)}</Text>
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const { c, s } = useTheme();
  const backgroundColor = disabled ? c.disabledBg : variant === 'primary' ? c.primary : variant === 'danger' ? c.dangerSolid : 'transparent';
  const color = disabled ? c.disabledText : variant === 'outline' ? c.link : c.primaryText;
  const outlineColor = disabled ? c.border : c.link;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={(state) => [
        s.button,
        {
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? outlineColor : 'transparent',
        },
        disabled ? null : pressFeedback(state, c),
        style,
      ]}>
      <Text style={[s.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export const Field = forwardRef<TextInputInstance, TextInputProps & { label: string; error?: string; hint?: string }>(function Field(
  { label: fieldLabel, error, hint, style, accessibilityLabel, accessibilityHint, ...props },
  ref,
) {
  const { c, s } = useTheme();
  return (
    <View style={s.field}>
      <View style={s.fieldHeader}>
        <Text style={s.fieldLabel}>{fieldLabel}</Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
      <TextInput
        ref={ref}
        placeholderTextColor={c.placeholder}
        accessibilityLabel={accessibilityLabel ?? fieldLabel}
        accessibilityHint={error ?? accessibilityHint}
        {...props}
        style={[s.input, props.multiline && s.inputMultiline, error ? { borderColor: c.danger } : null, style]}
      />
      {error ? (
        <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export function DemoBanner() {
  const { s } = useTheme();
  return (
    <View style={s.demo} accessibilityRole="text" accessibilityLabel="Demo mode. Local mock data, no Supabase project connected.">
      <Text style={s.demoText}>DEMO MODE · local mock data, no Supabase project connected</Text>
    </View>
  );
}

export function EmptyState({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  const { s } = useTheme();
  return (
    <View style={s.empty}>
      <Text style={[s.h2, s.center]}>{title}</Text>
      {body ? <Text style={[s.muted, s.center]}>{body}</Text> : null}
      {children}
    </View>
  );
}

/** RN 0.88's TextInput instance type omits focus(), which the native node still implements. */
export function focusField(ref: React.RefObject<TextInputInstance | null>) {
  (ref.current as { focus?: () => void } | null)?.focus?.();
}

export type { Palette };
