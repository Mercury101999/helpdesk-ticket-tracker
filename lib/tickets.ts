import { Priority, Profile, Status, Ticket } from './types';

export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Most urgent first; within a priority, newest first. Returns a new array. */
export function sortTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.created_at.localeCompare(a.created_at),
  );
}

export function filterTickets(tickets: Ticket[], status: Status | 'all', priority: Priority | 'all'): Ticket[] {
  return tickets.filter((t) => (status === 'all' || t.status === status) && (priority === 'all' || t.priority === priority));
}

/** Client-side mirror of the RLS select policy: requesters see only their own tickets. */
export function visibleTicketsFor(user: Profile | null, tickets: Ticket[]): Ticket[] {
  if (!user) return [];
  return user.role === 'requester' ? tickets.filter((t) => t.requester_id === user.id) : tickets;
}

const isDone = (s: Status) => s === 'resolved' || s === 'closed';

/** Mirrors the touch_ticket trigger: bumps updated_at and maintains resolved_at. */
export function applyTicketPatch(
  t: Ticket,
  patch: Partial<Pick<Ticket, 'status' | 'assignee_id' | 'priority'>>,
  now = new Date().toISOString(),
): Ticket {
  const next = { ...t, ...patch, updated_at: now };
  if (patch.status) next.resolved_at = isDone(patch.status) ? (isDone(t.status) ? t.resolved_at : now) : null;
  return next;
}

export function countByStatus(tickets: Ticket[]): Record<Status, number> {
  const counts: Record<Status, number> = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  for (const t of tickets) counts[t.status]++;
  return counts;
}
