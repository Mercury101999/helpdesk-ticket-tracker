import { ScrollView, Text, View } from 'react-native';

import { Badge, Button, C, s } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { isStaff } from '@/lib/types';

export default function Profile() {
  const { user, tickets, signOut, demoMode } = useData();
  if (!user) return null;
  const mine = tickets.filter((t) => t.requester_id === user.id);
  const assigned = tickets.filter((t) => t.assignee_id === user.id && t.status !== 'closed');

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <View style={s.card}>
        <Text style={s.h1}>{user.full_name}</Text>
        <Text style={[s.muted, { marginBottom: 8 }]}>{user.email}</Text>
        <View style={s.row}>
          <Badge text={user.role} color={isStaff(user) ? '#7c3aed' : C.primary} />
          {user.department ? <Badge text={user.department} color={C.muted} /> : null}
        </View>
      </View>
      <View style={[s.card, s.row, { justifyContent: 'space-around' }]}>
        <Stat n={mine.length} label="Submitted" />
        {isStaff(user) && <Stat n={assigned.length} label="Assigned to me" />}
        <Stat n={mine.filter((t) => t.status === 'resolved' || t.status === 'closed').length} label="Resolved" />
      </View>
      <View style={s.card}>
        <Text style={s.h2}>Permissions</Text>
        <Text style={s.body}>
          {isStaff(user)
            ? 'You can see every ticket, assign tickets and change status/priority.'
            : 'You can see and comment on tickets you submitted. IT staff manage status and assignment.'}
        </Text>
        <Text style={[s.muted, { marginTop: 6 }]}>
          {demoMode ? 'Demo mode emulates Supabase Row Level Security locally.' : 'Enforced server-side by Supabase Row Level Security.'}
        </Text>
      </View>
      <Button title="Sign out" variant="outline" onPress={signOut} />
    </ScrollView>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 4 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: C.text }}>{n}</Text>
      <Text style={s.muted}>{label}</Text>
    </View>
  );
}
