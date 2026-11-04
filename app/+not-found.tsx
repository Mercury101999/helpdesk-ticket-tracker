import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { C, s } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        <Text style={s.h2}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={{ color: C.primary, marginTop: 12 }}>Go to tickets</Link>
      </View>
    </>
  );
}
