import { ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Badge, Button, Chip } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { ThemePreference } from '@/lib/theme';
import { isStaff, label } from '@/lib/types';

const PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

export default function Profile() {
  const { user, tickets, signOut, demoMode } = useData();
  const { s, role, status, preference, setPreference } = useTheme();
  if (!user) return null;
  const mine = tickets.filter((t) => t.requester_id === user.id);
  const assigned = tickets.filter((t) => t.assignee_id === user.id && t.status !== 'closed');
  const resolved = mine.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 12 }}>
        <View style={s.card}>
          <Text style={s.h1}>{user.full_name}</Text>
          <Text style={[s.muted, { marginBottom: 8 }]}>{user.email}</Text>
          <View style={s.row}>
            <Badge text={user.role} tone={role(user.role)} />
            {user.department ? <Badge text={user.department} tone={status.closed} /> : null}
          </View>
        </View>
        <View style={[s.card, s.row, { justifyContent: 'space-around' }]}>
          <Stat n={mine.length} label="Submitted" />
          {isStaff(user) ? <Stat n={assigned.length} label="Assigned to me" /> : null}
          <Stat n={resolved} label="My resolved" />
        </View>
        <View style={s.card}>
          <Text style={s.h2}>Permissions</Text>
          <Text style={s.body}>
            {isStaff(user)
              ? 'You can see every ticket, assign tickets, and change status or priority.'
              : 'You can see and comment on tickets you submitted. IT staff manage status and assignment.'}
          </Text>
          <Text style={[s.muted, { marginTop: 6 }]}>
            {demoMode
              ? 'Demo mode emulates Supabase Row Level Security locally. Sign out to try another role.'
              : 'Enforced server-side by Supabase Row Level Security.'}
          </Text>
        </View>
        <View style={s.card}>
          <Text style={s.h2}>Appearance</Text>
          <Text style={[s.muted, { marginBottom: 10 }]}>System follows this device. Your choice is saved here.</Text>
          <View style={s.row}>
            {PREFERENCES.map((option) => (
              <Chip
                key={option}
                text={option}
                active={preference === option}
                onPress={() => setPreference(option)}
                accessibilityLabel={`Appearance: ${label(option)}`}
              />
            ))}
          </View>
        </View>
        <Button title="Sign out" variant="outline" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

function Stat({ n, label: statLabel }: { n: number; label: string }) {
  const { c, s } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 4 }} accessibilityLabel={`${n} ${statLabel}`}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: c.text }}>{n}</Text>
      <Text style={s.muted}>{statLabel}</Text>
    </View>
  );
}
