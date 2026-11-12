import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { Badge, Button, Chip, Field } from '@/components/ui';
import { useData } from '@/lib/DataProvider';
import { errorMessage } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { isStaff, label, STATUSES, TicketComment } from '@/lib/types';
import { validateComment } from '@/lib/validation';

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tickets, profiles, user, updateTicket, getComments, addComment } = useData();
  const { s, status: statusTone, priority: priorityTone } = useTheme();
  const ticket = tickets.find((t) => String(t.id) === id);
  const ticketId = ticket?.id;
  const [shownId, setShownId] = useState(ticketId);
  const [comments, setComments] = useState<TicketComment[] | null>(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string>();

  if (ticketId !== shownId) {
    setShownId(ticketId);
    setComments(null);
  }

  useEffect(() => {
    if (ticketId == null) return;
    let active = true;
    getComments(ticketId)
      .then((rows) => {
        if (active) setComments(rows);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(errorMessage(e));
        setComments([]);
      });
    return () => {
      active = false;
    };
  }, [ticketId, getComments]);

  if (!ticket) {
    return (
      <View style={[s.screen, { padding: 24 }]}>
        <Stack.Screen options={{ title: 'Ticket' }} />
        <View style={s.card}>
          <Text style={s.h2}>Ticket unavailable</Text>
          <Text style={s.body}>It does not exist, or your role cannot see it.</Text>
        </View>
      </View>
    );
  }

  const current = ticket;
  const staff = isStaff(user);
  const technicians = profiles.filter((p) => p.role !== 'requester');
  const nameOf = (uid: string | null) => profiles.find((p) => p.id === uid)?.full_name ?? 'Unassigned';
  const commentError = draft.trim().length > 2000 ? 'Comments must be 2,000 characters or fewer.' : undefined;

  const run = (task: Promise<unknown>) => {
    setError(undefined);
    return task.catch((e: unknown) => setError(errorMessage(e)));
  };

  async function postComment() {
    const message = validateComment(draft);
    if (message) {
      setError(message);
      return;
    }
    setPosting(true);
    setError(undefined);
    try {
      const created = await addComment(current.id, draft);
      setComments((current) => [...(current ?? []), created]);
      setDraft('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPosting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: `Ticket #${ticket.id}` }} />
        <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: priorityTone[ticket.priority].solid }]}>
          <Text style={s.muted}>
            #{ticket.id} · {label(ticket.category)} · opened {timeAgo(ticket.created_at)} by {nameOf(ticket.requester_id)}
          </Text>
          <Text style={[s.h1, { marginVertical: 8 }]}>{ticket.title}</Text>
          <View style={[s.row, { marginBottom: 10 }]}>
            <Badge text={ticket.status} tone={statusTone[ticket.status]} />
            <Badge text={ticket.priority} tone={priorityTone[ticket.priority]} />
          </View>
          <Text style={s.body}>{ticket.description}</Text>
          <Text style={[s.muted, { marginTop: 10 }]}>
            Assignee: {nameOf(ticket.assignee_id)} · updated {timeAgo(ticket.updated_at)}
            {ticket.resolved_at ? ` · resolved ${timeAgo(ticket.resolved_at)}` : ''}
          </Text>
        </View>

        {error ? (
          <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        {staff && (
          <View style={s.card}>
            <Text style={s.h2}>Technician actions</Text>
            <Text style={s.fieldLabel}>Status</Text>
            <View style={[s.row, { marginBottom: 12 }]}>
              {STATUSES.map((st) => (
                <Chip
                  key={st}
                  text={st}
                  active={ticket.status === st}
                  tone={statusTone[st]}
                  accessibilityLabel={`Set status to ${label(st)}`}
                  onPress={() => run(updateTicket(ticket.id, { status: st }))}
                />
              ))}
            </View>
            <Text style={s.fieldLabel}>Assignee</Text>
            <View style={s.row}>
              {technicians.map((person) => (
                <Chip
                  key={person.id}
                  text={person.full_name}
                  active={ticket.assignee_id === person.id}
                  accessibilityLabel={`Assign to ${person.full_name}`}
                  onPress={() => run(updateTicket(ticket.id, { assignee_id: person.id }))}
                />
              ))}
              <Chip
                text="Unassign"
                active={!ticket.assignee_id}
                tone={statusTone.closed}
                accessibilityLabel="Clear the assignee"
                onPress={() => run(updateTicket(ticket.id, { assignee_id: null }))}
              />
            </View>
            {user && ticket.assignee_id !== user.id && (
              <Button
                title="Assign to me"
                variant="outline"
                style={{ marginTop: 12 }}
                onPress={() =>
                  run(updateTicket(ticket.id, { assignee_id: user.id, status: ticket.status === 'open' ? 'in_progress' : ticket.status }))
                }
              />
            )}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.h2}>{comments ? `Comments (${comments.length})` : 'Comments'}</Text>
          {comments === null ? <Text style={[s.muted, { marginBottom: 8 }]}>Loading comments…</Text> : null}
          {comments?.length === 0 ? (
            <Text style={[s.muted, { marginBottom: 8 }]}>No comments yet. Add the first update below.</Text>
          ) : null}
          {comments?.map((comment) => (
            <View key={comment.id} style={s.comment}>
              <Text style={[s.muted, { fontWeight: '700' }]}>
                {nameOf(comment.author_id)} · {timeAgo(comment.created_at)}
              </Text>
              <Text style={s.body}>{comment.body}</Text>
            </View>
          ))}
          <Field
            label="Add a comment"
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Update, question, or resolution notes…"
            error={commentError}
            hint={draft.trim().length >= 1600 ? `${draft.trim().length}/2000` : undefined}
            maxLength={2000}
          />
          <Button title={posting ? 'Posting…' : 'Post comment'} onPress={postComment} disabled={posting || !draft.trim() || !!commentError} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
