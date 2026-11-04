import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { C } from '@/components/ui';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        // Disable the static render of the header on web to prevent a hydration error.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'list.bullet.rectangle', android: 'list', web: 'list' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'New Ticket',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'plus.circle', android: 'add_circle', web: 'add_circle' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }} tintColor={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
