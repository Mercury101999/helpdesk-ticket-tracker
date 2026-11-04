import { MOCK_PROFILES, MOCK_TICKETS } from '@/lib/mockData';
import { applyTicketPatch, countByStatus, filterTickets, sortTickets, visibleTicketsFor } from '@/lib/tickets';
import { Ticket } from '@/lib/types';

const base: Ticket = {
  id: 1, title: 't', description: 'd', category: 'other', priority: 'medium', status: 'open',
  requester_id: 'u1', assignee_id: null, created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z', resolved_at: null,
};
const t = (over: Partial<Ticket>): Ticket => ({ ...base, ...over });
const [requester, tech, admin] = MOCK_PROFILES;

describe('sortTickets', () => {
  it('orders by priority (urgent first), then newest first', () => {
    const sorted = sortTickets([
      t({ id: 1, priority: 'low', created_at: '2026-01-05T00:00:00Z' }),
      t({ id: 2, priority: 'urgent', created_at: '2026-01-01T00:00:00Z' }),
      t({ id: 3, priority: 'high', created_at: '2026-01-02T00:00:00Z' }),
      t({ id: 4, priority: 'high', created_at: '2026-01-03T00:00:00Z' }),
    ]);
    expect(sorted.map((x) => x.id)).toEqual([2, 4, 3, 1]);
  });

  it('does not mutate its input', () => {
    const input = [t({ id: 1, priority: 'low' }), t({ id: 2, priority: 'urgent' })];
    sortTickets(input);
    expect(input.map((x) => x.id)).toEqual([1, 2]);
  });
});

describe('filterTickets', () => {
  it('filters by status and priority, with "all" as a wildcard', () => {
    expect(filterTickets(MOCK_TICKETS, 'all', 'all')).toHaveLength(MOCK_TICKETS.length);
    expect(filterTickets(MOCK_TICKETS, 'open', 'all').every((x) => x.status === 'open')).toBe(true);
    expect(filterTickets(MOCK_TICKETS, 'open', 'urgent').map((x) => x.id)).toEqual([1042]);
    expect(filterTickets(MOCK_TICKETS, 'closed', 'low')).toEqual([]);
  });
});

describe('visibleTicketsFor (RLS mirror)', () => {
  it('shows requesters only their own tickets', () => {
    const mine = visibleTicketsFor(requester, MOCK_TICKETS);
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((x) => x.requester_id === requester.id)).toBe(true);
  });

  it('shows technicians and admins every ticket', () => {
    expect(visibleTicketsFor(tech, MOCK_TICKETS)).toHaveLength(MOCK_TICKETS.length);
    expect(visibleTicketsFor(admin, MOCK_TICKETS)).toHaveLength(MOCK_TICKETS.length);
  });

  it('shows nothing when signed out', () => {
    expect(visibleTicketsFor(null, MOCK_TICKETS)).toEqual([]);
  });
});

describe('applyTicketPatch', () => {
  const now = '2026-02-01T12:00:00.000Z';

  it('sets resolved_at when a ticket is resolved and bumps updated_at', () => {
    const next = applyTicketPatch(t({}), { status: 'resolved' }, now);
    expect(next).toMatchObject({ status: 'resolved', resolved_at: now, updated_at: now });
  });

  it('keeps the original resolved_at when moving resolved -> closed', () => {
    const resolved = t({ status: 'resolved', resolved_at: '2026-01-10T00:00:00Z' });
    expect(applyTicketPatch(resolved, { status: 'closed' }, now).resolved_at).toBe('2026-01-10T00:00:00Z');
  });

  it('clears resolved_at when a ticket is reopened', () => {
    const closed = t({ status: 'closed', resolved_at: '2026-01-10T00:00:00Z' });
    expect(applyTicketPatch(closed, { status: 'open' }, now).resolved_at).toBeNull();
  });

  it('leaves resolved_at alone for assignment-only changes', () => {
    const next = applyTicketPatch(t({}), { assignee_id: 'tech' }, now);
    expect(next).toMatchObject({ assignee_id: 'tech', resolved_at: null, status: 'open' });
  });
});

describe('countByStatus', () => {
  it('counts every status, including zeros', () => {
    expect(countByStatus([t({ status: 'open' }), t({ status: 'open' }), t({ status: 'closed' })])).toEqual({
      open: 2, in_progress: 0, resolved: 0, closed: 1,
    });
  });
});
