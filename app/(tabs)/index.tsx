import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, C, Chip, PRIORITY_COLORS, s, STATUS_COLORS } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { timeAgo } from '@/lib/format';
import { countByStatus, filterTickets, sortTickets } from '@/lib/tickets';
import { isStaff, label, Priority, PRIORITIES, Status, STATUSES } from '@/lib/types';

export default function TicketList() {
  const { tickets, user, profiles } = useData();
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [priority, setPriority] = useState<Priority | 'all'>('all');

  const visible = useMemo(
    () => sortTickets(filterTickets(tickets, status, priority)),
    [tickets, status, priority],
  );
  const counts = useMemo(() => countByStatus(tickets), [tickets]);
  const nameOf = (id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? 'Unassigned';

  return (
    <View style={s.screen}>
      <FlatList
        data={visible}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16, gap: 10, maxWidth: 820, width: '100%', alignSelf: 'center' }}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 4 }}>
            <Text style={s.muted}>
              {isStaff(user) ? 'All tickets (technician view)' : 'My tickets'} · {tickets.length} total
            </Text>
            <View style={s.row}>
              {STATUSES.map((st) => (
                <View key={st} style={[s.card, { paddingVertical: 8, minWidth: 92, borderLeftWidth: 4, borderLeftColor: STATUS_COLORS[st] }]}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>{counts[st]}</Text>
                  <Text style={s.muted}>{label(st)}</Text>
                </View>
              ))}
            </View>
            <Text style={s.fieldLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(['all', ...STATUSES] as const).map((st) => (
                <Chip key={st} text={st} active={status === st} onPress={() => setStatus(st)} color={st === 'all' ? C.primary : STATUS_COLORS[st]} />
              ))}
            </ScrollView>
            <Text style={s.fieldLabel}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(['all', ...PRIORITIES] as const).map((p) => (
                <Chip key={p} text={p} active={priority === p} onPress={() => setPriority(p)} color={p === 'all' ? C.primary : PRIORITY_COLORS[p]} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<Text style={[s.muted, { textAlign: 'center', marginTop: 32 }]}>No tickets match these filters.</Text>}
        renderItem={({ item: t }) => (
          <Link href={{ pathname: '/ticket/[id]', params: { id: String(t.id) } }} asChild>
            <Pressable style={StyleSheet.flatten([s.card, { borderLeftWidth: 4, borderLeftColor: PRIORITY_COLORS[t.priority] }])}>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <Text style={s.muted}>#{t.id} · {label(t.category)}</Text>
                <Text style={s.muted}>{timeAgo(t.created_at)}</Text>
              </View>
              <Text style={[s.body, { fontWeight: '600', marginVertical: 6 }]}>{t.title}</Text>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <View style={s.row}>
                  <Badge text={t.status} color={STATUS_COLORS[t.status]} />
                  <Badge text={t.priority} color={PRIORITY_COLORS[t.priority]} />
                </View>
                <Text style={s.muted}>{nameOf(t.assignee_id)}</Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
