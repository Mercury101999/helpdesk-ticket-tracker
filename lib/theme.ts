import { Platform, StyleSheet, ViewStyle } from 'react-native';

import { Priority, Role, Status } from './types';

export type Scheme = 'light' | 'dark';
export type ThemePreference = 'system' | Scheme;

/** Foreground, tinted background, and a solid fill that keeps white text at WCAG AA. */
export interface Tone {
  fg: string;
  bg: string;
  solid: string;
}

export interface Palette {
  bg: string;
  /** Page color behind the centered web column. */
  chrome: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  link: string;
  /** Error text and field borders. */
  danger: string;
  /** Filled danger button. White text stays above 4.5:1. */
  dangerSolid: string;
  placeholder: string;
  disabledBg: string;
  disabledText: string;
  demoBg: string;
  demoText: string;
  demoBorder: string;
  input: string;
  success: string;
}

export const palettes: Record<Scheme, Palette> = {
  light: {
    bg: '#f4f6fb',
    chrome: '#e8edf5',
    card: '#ffffff',
    text: '#1b2333',
    muted: '#4b5563',
    border: '#e2e6ef',
    primary: '#2563eb',
    primaryText: '#ffffff',
    link: '#1d4ed8',
    danger: '#b91c1c',
    dangerSolid: '#b91c1c',
    placeholder: '#6b7280',
    disabledBg: '#e5e7eb',
    disabledText: '#4b5563',
    demoBg: '#fef3c7',
    demoText: '#78350f',
    demoBorder: '#d97706',
    input: '#ffffff',
    success: '#166534',
  },
  dark: {
    bg: '#0f1419',
    chrome: '#0b0f14',
    card: '#1a212b',
    text: '#e7ecf3',
    muted: '#b7c0ce',
    border: '#2c3644',
    primary: '#2563eb',
    primaryText: '#ffffff',
    link: '#93c5fd',
    danger: '#fca5a5',
    dangerSolid: '#b91c1c',
    placeholder: '#9aa6b6',
    disabledBg: '#2c3644',
    disabledText: '#cbd5e1',
    demoBg: '#451a03',
    demoText: '#fde68a',
    demoBorder: '#d97706',
    input: '#121820',
    success: '#86efac',
  },
};

export const statusTones: Record<Scheme, Record<Status, Tone>> = {
  light: {
    open: { fg: '#1e3a8a', bg: '#dbeafe', solid: '#1d4ed8' },
    in_progress: { fg: '#9a3412', bg: '#ffedd5', solid: '#c2410c' },
    resolved: { fg: '#14532d', bg: '#dcfce7', solid: '#15803d' },
    closed: { fg: '#1f2937', bg: '#e5e7eb', solid: '#4b5563' },
  },
  dark: {
    open: { fg: '#dbeafe', bg: '#1e3a8a', solid: '#2563eb' },
    in_progress: { fg: '#ffedd5', bg: '#7c2d12', solid: '#c2410c' },
    resolved: { fg: '#dcfce7', bg: '#14532d', solid: '#15803d' },
    closed: { fg: '#e5e7eb', bg: '#374151', solid: '#4b5563' },
  },
};

export const priorityTones: Record<Scheme, Record<Priority, Tone>> = {
  light: {
    low: { fg: '#334155', bg: '#e2e8f0', solid: '#475569' },
    medium: { fg: '#155e75', bg: '#cffafe', solid: '#0e7490' },
    high: { fg: '#9a3412', bg: '#ffedd5', solid: '#c2410c' },
    urgent: { fg: '#991b1b', bg: '#fee2e2', solid: '#b91c1c' },
  },
  dark: {
    low: { fg: '#e2e8f0', bg: '#334155', solid: '#475569' },
    medium: { fg: '#cffafe', bg: '#164e63', solid: '#0e7490' },
    high: { fg: '#ffedd5', bg: '#7c2d12', solid: '#c2410c' },
    urgent: { fg: '#fee2e2', bg: '#7f1d1d', solid: '#b91c1c' },
  },
};

export const roleTones: Record<Scheme, Record<'requester' | 'staff', Tone>> = {
  light: {
    requester: { fg: '#1e3a8a', bg: '#dbeafe', solid: '#1d4ed8' },
    staff: { fg: '#5b21b6', bg: '#ede9fe', solid: '#6d28d9' },
  },
  dark: {
    requester: { fg: '#dbeafe', bg: '#1e3a8a', solid: '#2563eb' },
    staff: { fg: '#ddd6fe', bg: '#4c1d95', solid: '#6d28d9' },
  },
};

export const roleTone = (scheme: Scheme, role: Role) => roleTones[scheme][role === 'requester' ? 'requester' : 'staff'];

export function makeStyles(c: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' },
    formContent: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
    authContent: { padding: 24, maxWidth: 440, width: '100%', alignSelf: 'center' },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
    h1: { fontSize: 22, fontWeight: '700', color: c.text },
    h2: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 },
    body: { fontSize: 15, color: c.text, lineHeight: 22 },
    muted: { fontSize: 13, color: c.muted, lineHeight: 18 },
    center: { textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    statsRow: { flexDirection: 'row', gap: 8 },
    stat: { flex: 1, minWidth: 72, paddingVertical: 10, paddingHorizontal: 8, borderLeftWidth: 4 },
    statValue: { fontSize: 18, fontWeight: '700', color: c.text },
    badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    chip: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: { fontSize: 13, color: c.text, fontWeight: '600' },
    button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
    buttonText: { fontWeight: '700', fontSize: 15 },
    field: { marginBottom: 14 },
    fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 6 },
    hint: { fontSize: 12, color: c.muted, marginBottom: 6 },
    input: {
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: c.text,
    },
    inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
    error: { color: c.danger, fontSize: 13, lineHeight: 18, marginTop: 4 },
    success: { color: c.success, fontSize: 13, lineHeight: 18, marginBottom: 12 },
    link: { color: c.link, textAlign: 'center', marginTop: 16, textDecorationLine: 'underline', fontSize: 15, fontWeight: '600' },
    demo: { backgroundColor: c.demoBg, borderBottomWidth: 1, borderColor: c.demoBorder, paddingVertical: 6, paddingHorizontal: 12 },
    demoText: { color: c.demoText, fontSize: 12, fontWeight: '700', textAlign: 'center' },
    empty: { backgroundColor: c.card, borderRadius: 12, padding: 24, borderWidth: 1, borderColor: c.border, alignItems: 'center', gap: 8, marginTop: 8 },
    comment: { borderTopWidth: 1, borderColor: c.border, paddingVertical: 10, gap: 2 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  });
}

export type AppStyles = ReturnType<typeof makeStyles>;

type PressState = { pressed: boolean; focused?: boolean };

/** Pressed feedback, plus a visible keyboard ring on web. Native draws its own focus. */
export function pressFeedback(state: { pressed: boolean }, c: Palette): ViewStyle {
  const { pressed, focused } = state as PressState;
  return {
    opacity: pressed ? 0.86 : 1,
    ...(Platform.OS === 'web' && focused
      ? { outlineWidth: 2, outlineStyle: 'solid', outlineColor: c.primary, outlineOffset: 2 }
      : null),
  };
}
