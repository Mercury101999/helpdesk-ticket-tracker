import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, Text, useWindowDimensions, View } from 'react-native';

import { AppTheme, useTheme } from '@/components/ThemeProvider';
import { DemoBanner } from '@/components/ui';
import { DataProvider, useData } from '@/lib/DataProvider';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <DataProvider>
      <AppTheme>
        <RootNav />
      </AppTheme>
    </DataProvider>
  );
}

function RootNav() {
  const { user, loading, demoMode } = useData();
  const { c, s, scheme } = useTheme();
  const { width } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width > 920;

  if (loading) {
    return (
      <View style={[s.screen, s.centered]}>
        <ActivityIndicator color={c.primary} accessibilityLabel="Loading" />
        <Text style={s.muted}>Loading your queue…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: framed ? c.chrome : c.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View
        style={[
          { flex: 1, width: '100%', alignSelf: 'center', backgroundColor: c.bg },
          framed ? { maxWidth: 880, borderLeftWidth: 1, borderRightWidth: 1, borderColor: c.border } : null,
        ]}>
        {demoMode && <DemoBanner />}
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.card },
            headerTintColor: c.text,
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: c.bg },
          }}>
          {/* Auth gate: protected routes are only reachable when signed in. */}
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ticket/[id]" options={{ title: 'Ticket' }} />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </View>
    </View>
  );
}
