import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Badge, Button, Chip, EmptyState } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { timeAgo } from '@/lib/format';
import { pressFeedback } from '@/lib/theme';
import { countByStatus, filterTickets, sortTickets } from '@/lib/tickets';
import { isStaff, label, Priority, PRIORITIES, Status, STATUSES } from '@/lib/types';

export default function TicketList() {
  const { tickets, user, profiles } = useData();
  const { c, s, status: statusTone, priority: priorityTone } = useTheme();
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const filtersOn = status !== 'all' || priority !== 'all';

  const visible = useMemo(() => sortTickets(filterTickets(tickets, status, priority)), [tickets, status, priority]);
  const counts = useMemo(() => countByStatus(tickets), [tickets]);
  const nameOf = (id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? 'Unassigned';

  function clearFilters() {
    setStatus('all');
    setPriority('all');
  }

  return (
    <View style={s.screen}>
      <FlatList
        data={visible}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={s.content}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 4 }}>
            <Text style={s.muted}>{isStaff(user) ? 'All tickets (technician view)' : 'My tickets'} · {tickets.length} total</Text>
            <View style={s.statsRow}>
              {STATUSES.map((st) => {
                const selected = status === st;
                const tone = statusTone[st];
                return (
                  <Pressable
                    key={st}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    aria-selected={selected}
                    accessibilityLabel={`${counts[st]} ${label(st)}. ${selected ? 'Showing this status. Activate to show every status.' : 'Filter by this status.'}`}
                    onPress={() => setStatus(selected ? 'all' : st)}
                    style={(state) => [
                      s.card,
                      s.stat,
                      {
                        borderLeftColor: tone.solid,
                        backgroundColor: selected ? tone.bg : c.card,
                        borderColor: selected ? tone.solid : c.border,
                      },
                      pressFeedback(state, c),
                    ]}>
                    <Text style={s.statValue}>{counts[st]}</Text>
                    <Text style={s.muted}>{label(st)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Text style={s.muted}>Sorted by priority, then newest.</Text>
              {filtersOn ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear filters" onPress={clearFilters}>
                  <Text style={{ color: c.link, fontWeight: '700', fontSize: 13 }}>Clear filters</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={s.fieldLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['all', ...STATUSES] as const).map((st) => (
                <Chip
                  key={st}
                  text={st}
                  active={status === st}
                  onPress={() => setStatus(st)}
                  tone={st === 'all' ? undefined : statusTone[st]}
                  accessibilityLabel={`Filter status: ${label(st)}`}
                />
              ))}
            </ScrollView>
            <Text style={s.fieldLabel}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['all', ...PRIORITIES] as const).map((p) => (
                <Chip
                  key={p}
                  text={p}
                  active={priority === p}
                  onPress={() => setPriority(p)}
                  tone={p === 'all' ? undefined : priorityTone[p]}
                  accessibilityLabel={`Filter priority: ${label(p)}`}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          filtersOn ? (
            <EmptyState title="No tickets match" body="Nothing in the queue has this status and priority.">
              <Button title="Clear filters" variant="outline" onPress={clearFilters} />
            </EmptyState>
          ) : (
            <EmptyState
              title={isStaff(user) ? 'The queue is empty' : 'No tickets yet'}
              body={isStaff(user) ? 'New requests will show up here.' : 'Submit a ticket from the New Ticket tab and it will show up here.'}
            />
          )
        }
        renderItem={({ item: t }) => (
          <Link href={{ pathname: '/ticket/[id]', params: { id: String(t.id) } }} asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Ticket ${t.id}, ${t.title}, ${label(t.status)}, ${label(t.priority)} priority, ${nameOf(t.assignee_id)}`}
              style={(state) => [
                s.card,
                { borderLeftWidth: 4, borderLeftColor: priorityTone[t.priority].solid },
                pressFeedback(state, c),
              ]}>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <Text style={s.muted}>#{t.id} · {label(t.category)}</Text>
                <Text style={s.muted}>{timeAgo(t.created_at)}</Text>
              </View>
              <Text style={[s.body, { fontWeight: '600', marginVertical: 6 }]}>{t.title}</Text>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <View style={s.row}>
                  <Badge text={t.status} tone={statusTone[t.status]} />
                  <Badge text={t.priority} tone={priorityTone[t.priority]} />
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
