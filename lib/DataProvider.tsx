import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { MOCK_COMMENTS, MOCK_PROFILES, MOCK_TICKETS } from './mockData';
import { DEMO_MODE, supabase } from './supabase';
import { NewTicketInput, Profile, Role, Status, Ticket, TicketComment } from './types';

/**
 * Single data layer for the app. In DEMO_MODE everything lives in React state (mock data);
 * otherwise calls go to Supabase, where Row Level Security enforces who can see/change what.
 */
interface DataContextValue {
  demoMode: boolean;
  loading: boolean;
  user: Profile | null;
  profiles: Profile[];
  tickets: Ticket[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  demoSignIn: (role: Role) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  createTicket: (input: NewTicketInput) => Promise<Ticket>;
  updateTicket: (id: number, patch: Partial<Pick<Ticket, 'status' | 'assignee_id' | 'priority'>>) => Promise<void>;
  getComments: (ticketId: number) => Promise<TicketComment[]>;
  addComment: (ticketId: number, body: string) => Promise<TicketComment>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [user, setUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(DEMO_MODE ? MOCK_PROFILES : []);
  const [allTickets, setAllTickets] = useState<Ticket[]>(DEMO_MODE ? MOCK_TICKETS : []);
  const [comments, setComments] = useState<TicketComment[]>(DEMO_MODE ? MOCK_COMMENTS : []);

  // In demo mode, emulate the RLS rule "requesters only see their own tickets".
  const tickets = useMemo(() => {
    if (!DEMO_MODE || !user) return allTickets;
    return user.role === 'requester' ? allTickets.filter((t) => t.requester_id === user.id) : allTickets;
  }, [allTickets, user]);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    setUser(data as Profile);
  }, []);

  const refresh = useCallback(async () => {
    if (DEMO_MODE || !supabase) return;
    const [t, p] = await Promise.all([
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ]);
    if (t.error) throw t.error;
    setAllTickets(t.data as Ticket[]);
    if (!p.error) setProfiles(p.data as Profile[]);
  }, []);

  useEffect(() => {
    if (DEMO_MODE || !supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await loadProfile(data.session.user.id).catch(() => setUser(null));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadProfile(session.user.id).catch(() => setUser(null));
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    if (user) refresh().catch(() => undefined);
  }, [user, refresh]);

  const value: DataContextValue = {
    demoMode: DEMO_MODE,
    loading,
    user,
    profiles,
    tickets,
    refresh,

    async signIn(email, password) {
      if (DEMO_MODE) {
        const match = MOCK_PROFILES.find((p) => p.email === email.trim().toLowerCase());
        setUser(match ?? MOCK_PROFILES[0]);
        return;
      }
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signUp(fullName, email, password) {
      if (DEMO_MODE) {
        const profile: Profile = { id: `u-${Date.now()}`, full_name: fullName, email, department: null, role: 'requester' };
        setProfiles((ps) => [...ps, profile]);
        setUser(profile);
        return;
      }
      const { error } = await supabase!.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
    },

    demoSignIn(role) {
      setUser(MOCK_PROFILES.find((p) => p.role === role) ?? MOCK_PROFILES[0]);
    },

    async signOut() {
      if (!DEMO_MODE) await supabase!.auth.signOut();
      setUser(null);
    },

    async createTicket(input) {
      if (DEMO_MODE) {
        const now = new Date().toISOString();
        const ticket: Ticket = {
          ...input,
          title: input.title.trim(),
          description: input.description.trim(),
          id: Math.max(0, ...allTickets.map((t) => t.id)) + 1,
          status: 'open',
          requester_id: user!.id,
          assignee_id: null,
          created_at: now,
          updated_at: now,
          resolved_at: null,
        };
        setAllTickets((ts) => [ticket, ...ts]);
        return ticket;
      }
      const { data, error } = await supabase!.from('tickets').insert(input).select().single();
      if (error) throw error;
      setAllTickets((ts) => [data as Ticket, ...ts]);
      return data as Ticket;
    },

    async updateTicket(id, patch) {
      if (DEMO_MODE) {
        const now = new Date().toISOString();
        setAllTickets((ts) =>
          ts.map((t) => {
            if (t.id !== id) return t;
            const next = { ...t, ...patch, updated_at: now };
            const done = (s: Status) => s === 'resolved' || s === 'closed';
            if (patch.status) next.resolved_at = done(patch.status) ? (done(t.status) ? t.resolved_at : now) : null;
            return next;
          }),
        );
        return;
      }
      const { data, error } = await supabase!.from('tickets').update(patch).eq('id', id).select().single();
      if (error) throw error;
      setAllTickets((ts) => ts.map((t) => (t.id === id ? (data as Ticket) : t)));
    },

    async getComments(ticketId) {
      if (DEMO_MODE) return comments.filter((c) => c.ticket_id === ticketId);
      const { data, error } = await supabase!
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at');
      if (error) throw error;
      return data as TicketComment[];
    },

    async addComment(ticketId, body) {
      if (DEMO_MODE) {
        const c: TicketComment = { id: Date.now(), ticket_id: ticketId, author_id: user!.id, body: body.trim(), created_at: new Date().toISOString() };
        setComments((cs) => [...cs, c]);
        return c;
      }
      const { data, error } = await supabase!.from('ticket_comments').insert({ ticket_id: ticketId, body: body.trim() }).select().single();
      if (error) throw error;
      return data as TicketComment;
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
