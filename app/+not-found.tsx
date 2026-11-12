import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { EmptyState } from '@/components/ui';

export default function NotFoundScreen() {
  const { c, s } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={[s.screen, s.centered]}>
        <EmptyState title="This screen does not exist" body="The link may be out of date.">
          <Link href="/" style={{ color: c.link, textDecorationLine: 'underline', fontWeight: '600' }}>
            <Text>Back to tickets</Text>
          </Link>
        </EmptyState>
      </View>
    </>
  );
}
