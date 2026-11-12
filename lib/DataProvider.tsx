import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { MOCK_COMMENTS, MOCK_PROFILES, MOCK_TICKETS } from './mockData';
import { DEMO_MODE, supabase } from './supabase';
import { applyTicketPatch, visibleTicketsFor } from './tickets';
import { NewTicketInput, Profile, Role, Ticket, TicketComment } from './types';
import { validateComment } from './validation';

const DEMO_SIGN_IN_HINT =
  'No demo account uses that email. Use the role buttons, or alex.requester@example.com, sam.tech@example.com, or jordan.admin@example.com.';

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
    if (!DEMO_MODE) return allTickets;
    return visibleTicketsFor(user, allTickets);
  }, [allTickets, user]);

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

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    setUser(data as Profile);
    await refresh();
  }, [refresh]);

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

  const signIn = useCallback(async (email: string, password: string) => {
    if (DEMO_MODE) {
      const match = MOCK_PROFILES.find((p) => p.email?.toLowerCase() === email.trim().toLowerCase());
      if (!match) throw new Error(DEMO_SIGN_IN_HINT);
      setUser(match);
      return;
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (DEMO_MODE) {
      const profile: Profile = {
        id: `u-${Date.now()}`,
        full_name: fullName,
        email: email.trim().toLowerCase(),
        department: null,
        role: 'requester',
      };
      setProfiles((ps) => [...ps, profile]);
      setUser(profile);
      return;
    }
    const { error } = await supabase!.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
  }, []);

  const demoSignIn = useCallback((role: Role) => {
    setUser(MOCK_PROFILES.find((p) => p.role === role) ?? MOCK_PROFILES[0]);
  }, []);

  const signOut = useCallback(async () => {
    if (!DEMO_MODE) await supabase!.auth.signOut();
    setUser(null);
  }, []);

  const createTicket = useCallback(async (input: NewTicketInput) => {
    if (!user) throw new Error('You need to be signed in to submit a ticket.');
    const payload = { ...input, title: input.title.trim(), description: input.description.trim() };
    if (DEMO_MODE) {
      const now = new Date().toISOString();
      const ticket: Ticket = {
        ...payload,
        id: Math.max(0, ...allTickets.map((t) => t.id)) + 1,
        status: 'open',
        requester_id: user.id,
        assignee_id: null,
        created_at: now,
        updated_at: now,
        resolved_at: null,
      };
      setAllTickets((ts) => [ticket, ...ts]);
      return ticket;
    }
    const { data, error } = await supabase!.from('tickets').insert(payload).select().single();
    if (error) throw error;
    setAllTickets((ts) => [data as Ticket, ...ts]);
    return data as Ticket;
  }, [user, allTickets]);

  const updateTicket = useCallback(async (id: number, patch: Partial<Pick<Ticket, 'status' | 'assignee_id' | 'priority'>>) => {
    if (DEMO_MODE) {
      setAllTickets((ts) => ts.map((t) => (t.id === id ? applyTicketPatch(t, patch) : t)));
      return;
    }
    const { data, error } = await supabase!.from('tickets').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setAllTickets((ts) => ts.map((t) => (t.id === id ? (data as Ticket) : t)));
  }, []);

  const getComments = useCallback(async (ticketId: number) => {
    if (DEMO_MODE) return comments.filter((c) => c.ticket_id === ticketId);
    const { data, error } = await supabase!.from('ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at');
    if (error) throw error;
    return data as TicketComment[];
  }, [comments]);

  const addComment = useCallback(async (ticketId: number, body: string) => {
    const message = validateComment(body);
    if (message) throw new Error(message);
    if (!user) throw new Error('You need to be signed in to comment.');
    const text = body.trim();
    if (DEMO_MODE) {
      const created: TicketComment = {
        id: Date.now(),
        ticket_id: ticketId,
        author_id: user.id,
        body: text,
        created_at: new Date().toISOString(),
      };
      setComments((cs) => [...cs, created]);
      return created;
    }
    const { data, error } = await supabase!.from('ticket_comments').insert({ ticket_id: ticketId, body: text }).select().single();
    if (error) throw error;
    return data as TicketComment;
  }, [user]);

  const value = useMemo<DataContextValue>(
    () => ({
      demoMode: DEMO_MODE,
      loading,
      user,
      profiles,
      tickets,
      refresh,
      signIn,
      signUp,
      demoSignIn,
      signOut,
      createTicket,
      updateTicket,
      getComments,
      addComment,
    }),
    [loading, user, profiles, tickets, refresh, signIn, signUp, demoSignIn, signOut, createTicket, updateTicket, getComments, addComment],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
