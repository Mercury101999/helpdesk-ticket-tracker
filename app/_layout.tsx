import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {demoMode && <DemoBanner />}
      <Stack>
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
  );
}
