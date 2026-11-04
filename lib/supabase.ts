import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Demo mode: no Supabase credentials configured, so the app runs on local mock data. */
export const DEMO_MODE = !url || !anonKey;

export const supabase: SupabaseClient | null = DEMO_MODE
  ? null
  : createClient(url, anonKey, {
      auth: {
        // AsyncStorage touches `window` during static web rendering, so only use it on native/browser.
        storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
