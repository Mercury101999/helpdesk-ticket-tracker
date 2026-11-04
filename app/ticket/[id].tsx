import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Badge, Button, C, Chip, Field, PRIORITY_COLORS, s, STATUS_COLORS } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { timeAgo } from '@/lib/format';
import { isStaff, label, STATUSES, TicketComment } from '@/lib/types';

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tickets, profiles, user, updateTicket, getComments, addComment } = useData();
  const ticket = tickets.find((t) => String(t.id) === id);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (ticket) getComments(ticket.id).then(setComments).catch((e: Error) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id]);

  if (!ticket) {
    return (
      <View style={[s.screen, { padding: 24 }]}>
        <Text style={s.body}>Ticket not found, or you do not have access to it.</Text>
      </View>
    );
  }

  const staff = isStaff(user);
  const technicians = profiles.filter((p) => p.role !== 'requester');
  const nameOf = (uid: string | null) => profiles.find((p) => p.id === uid)?.full_name ?? 'Unassigned';
  const run = (p: Promise<unknown>) => p.catch((e: Error) => setError(e.message));

  async function postComment() {
    if (!draft.trim()) return;
    try {
      const c = await addComment(ticket!.id, draft);
      setComments((cs) => [...cs, c]);
      setDraft('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
      <Stack.Screen options={{ title: `Ticket #${ticket.id}` }} />
      <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: PRIORITY_COLORS[ticket.priority] }]}>
        <Text style={s.muted}>#{ticket.id} · {label(ticket.category)} · opened {timeAgo(ticket.created_at)} by {nameOf(ticket.requester_id)}</Text>
        <Text style={[s.h1, { marginVertical: 8 }]}>{ticket.title}</Text>
        <View style={[s.row, { marginBottom: 10 }]}>
          <Badge text={ticket.status} color={STATUS_COLORS[ticket.status]} />
          <Badge text={ticket.priority} color={PRIORITY_COLORS[ticket.priority]} />
        </View>
        <Text style={s.body}>{ticket.description}</Text>
        <Text style={[s.muted, { marginTop: 10 }]}>
          Assignee: {nameOf(ticket.assignee_id)} · updated {timeAgo(ticket.updated_at)}
        </Text>
      </View>

      {staff && (
        <View style={s.card}>
          <Text style={s.h2}>Manage (technician)</Text>
          <Text style={s.fieldLabel}>Status</Text>
          <View style={[s.row, { marginBottom: 12 }]}>
            {STATUSES.map((st) => (
              <Chip key={st} text={st} active={ticket.status === st} color={STATUS_COLORS[st]}
                onPress={() => run(updateTicket(ticket.id, { status: st }))} />
            ))}
          </View>
          <Text style={s.fieldLabel}>Assignee</Text>
          <View style={s.row}>
            {technicians.map((p) => (
              <Chip key={p.id} text={p.full_name} active={ticket.assignee_id === p.id}
                onPress={() => run(updateTicket(ticket.id, { assignee_id: p.id }))} />
            ))}
            <Chip text="Unassign" active={!ticket.assignee_id} color={C.muted} onPress={() => run(updateTicket(ticket.id, { assignee_id: null }))} />
          </View>
          {user && ticket.assignee_id !== user.id && (
            <Button title="Assign to me" variant="outline" style={{ marginTop: 12 }}
              onPress={() => run(updateTicket(ticket.id, { assignee_id: user.id, status: ticket.status === 'open' ? 'in_progress' : ticket.status }))} />
          )}
        </View>
      )}

      <View style={s.card}>
        <Text style={s.h2}>Comments ({comments.length})</Text>
        {comments.length === 0 && <Text style={[s.muted, { marginBottom: 8 }]}>No comments yet.</Text>}
        {comments.map((c) => (
          <View key={c.id} style={{ borderTopWidth: 1, borderColor: C.border, paddingVertical: 8 }}>
            <Text style={[s.muted, { fontWeight: '600' }]}>{nameOf(c.author_id)} · {timeAgo(c.created_at)}</Text>
            <Text style={s.body}>{c.body}</Text>
          </View>
        ))}
        <Field label="Add a comment" value={draft} onChangeText={setDraft} multiline placeholder="Update, question or resolution notes…" />
        <Button title="Post comment" onPress={postComment} disabled={!draft.trim()} />
        {error ? <Text style={[s.error, { marginTop: 8 }]}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}
