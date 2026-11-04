import { DefaultTheme, Redirect, Stack, ThemeProvider, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { DemoBanner } from '@/components/ui';
import { DataProvider, useData } from '@/lib/DataProvider';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <DataProvider>
      <ThemeProvider value={DefaultTheme}>
        <RootNav />
      </ThemeProvider>
    </DataProvider>
  );
}

function RootNav() {
  const { user, loading, demoMode } = useData();
  const segments = useSegments();
  const inAuth = segments[0] === '(auth)';

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  // Simple auth gate: signed-out users go to sign-in, signed-in users skip it.
  if (!user && !inAuth) return <Redirect href="/sign-in" />;
  if (user && inAuth) return <Redirect href="/" />;

  return (
    <View style={{ flex: 1 }}>
      {demoMode && <DemoBanner />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="ticket/[id]" options={{ title: 'Ticket' }} />
      </Stack>
    </View>
  );
}
