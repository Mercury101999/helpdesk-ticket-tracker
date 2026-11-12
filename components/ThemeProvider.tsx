import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

import {
  AppStyles,
  makeStyles,
  Palette,
  palettes,
  priorityTones,
  roleTone,
  Scheme,
  statusTones,
  ThemePreference,
  Tone,
} from '@/lib/theme';
import { Role } from '@/lib/types';

const STORAGE_KEY = 'helpdesk-theme';

interface ThemeContextValue {
  scheme: Scheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  c: Palette;
  s: AppStyles;
  status: (typeof statusTones)['light'];
  priority: (typeof priorityTones)['light'];
  role: (role: Role) => Tone;
}

const lightValue: ThemeContextValue = {
  scheme: 'light',
  preference: 'system',
  setPreference: () => {},
  c: palettes.light,
  s: makeStyles(palettes.light),
  status: statusTones.light,
  priority: priorityTones.light,
  role: (role) => roleTone('light', role),
};

const ThemeContext = createContext<ThemeContextValue>(lightValue);

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function AppTheme({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isPreference(stored)) setPreferenceState(stored);
      })
      .catch(() => {});
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const c = palettes[scheme];
  const s = useMemo(() => makeStyles(c), [c]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  useWebDocument(scheme, c.bg);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      preference,
      setPreference,
      c,
      s,
      status: statusTones[scheme],
      priority: priorityTones[scheme],
      role: (role) => roleTone(scheme, role),
    }),
    [scheme, preference, setPreference, c, s],
  );

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.bg,
      card: c.card,
      text: c.text,
      border: c.border,
      notification: c.danger,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

const DOCUMENT_TITLE = 'IT Help Desk Ticket Tracker';
const DOCUMENT_DESCRIPTION =
  'Submit, triage, and resolve IT support tickets. Try the demo as a requester, technician, or admin. No sign-up required.';

/** Single-page web export does not apply +html.tsx, so the client sets the document shell. */
function useWebDocument(scheme: Scheme, background: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = DOCUMENT_TITLE;
    upsertMeta('description', DOCUMENT_DESCRIPTION);
    upsertMeta('theme-color', background);
    document.body.style.backgroundColor = scheme === 'dark' ? palettes.dark.chrome : palettes.light.chrome;
    if (!document.getElementById('helpdesk-focus')) {
      const style = document.createElement('style');
      style.id = 'helpdesk-focus';
      style.textContent =
        'a:focus-visible,[role="button"]:focus-visible,[role="link"]:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #2563eb !important;outline-offset:2px}';
      document.head.appendChild(style);
    }
  }, [scheme, background]);
}

function upsertMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
