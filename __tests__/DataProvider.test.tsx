import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

import { DataProvider, useData } from '@/lib/DataProvider';
import { MOCK_TICKETS } from '@/lib/mockData';

const wrapper = ({ children }: { children: React.ReactNode }) => <DataProvider>{children}</DataProvider>;
const setup = () => renderHook(() => useData(), { wrapper });

describe('DataProvider (demo mode)', () => {
  it('runs in demo mode when no Supabase env vars are set', async () => {
    const { result } = await setup();
    expect(result.current.demoMode).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('limits a requester to their own tickets', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('requester'));
    const me = result.current.user!;
    expect(me.role).toBe('requester');
    expect(result.current.tickets.length).toBeLessThan(MOCK_TICKETS.length);
    expect(result.current.tickets.every((t) => t.requester_id === me.id)).toBe(true);
  });

  it('gives technicians the full queue', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('technician'));
    expect(result.current.tickets).toHaveLength(MOCK_TICKETS.length);
  });

  it('creates an open ticket owned by the current user with the next id', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('requester'));
    let created!: Awaited<ReturnType<typeof result.current.createTicket>>;
    await act(async () => {
      created = await result.current.createTicket({
        title: '  Monitor flickering  ', description: 'Second screen flickers constantly.', category: 'hardware', priority: 'low',
      });
    });
    expect(created).toMatchObject({ id: 1043, title: 'Monitor flickering', status: 'open', requester_id: result.current.user!.id });
    expect(result.current.tickets[0].id).toBe(1043);
  });

  it('updates status and resolved_at, and assigns tickets', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('technician'));
    const techId = result.current.user!.id;
    await act(() => result.current.updateTicket(1042, { status: 'resolved', assignee_id: techId }));
    const t = result.current.tickets.find((x) => x.id === 1042)!;
    expect(t.status).toBe('resolved');
    expect(t.assignee_id).toBe(techId);
    expect(t.resolved_at).not.toBeNull();
  });

  it('stores and returns comments per ticket', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('technician'));
    const before = await result.current.getComments(1041);
    await act(async () => {
      await result.current.addComment(1041, '  Adapter swapped.  ');
    });
    const after = await result.current.getComments(1041);
    expect(after).toHaveLength(before.length + 1);
    expect(after[after.length - 1].body).toBe('Adapter swapped.');
  });

  it('signs in a known demo email and rejects an unknown one', async () => {
    const { result } = await setup();
    await act(async () => {
      await result.current.signIn('  Sam.Tech@example.com ', 'secret12');
    });
    expect(result.current.user?.role).toBe('technician');
    await act(async () => {
      await result.current.signOut();
    });
    await expect(
      act(async () => {
        await result.current.signIn('nobody@example.com', 'secret12');
      }),
    ).rejects.toThrow(/demo account/);
    expect(result.current.user).toBeNull();
  });

  it('rejects a comment that would fail the database check', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('technician'));
    await expect(result.current.addComment(1041, 'x'.repeat(2001))).rejects.toThrow(/2,000/);
    expect(await result.current.getComments(1041)).toHaveLength(2);
  });

  it('signs out', async () => {
    const { result } = await setup();
    await act(async () => result.current.demoSignIn('admin'));
    await act(() => result.current.signOut());
    expect(result.current.user).toBeNull();
  });
});
