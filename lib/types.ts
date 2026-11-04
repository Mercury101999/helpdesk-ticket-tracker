export type Role = 'requester' | 'technician' | 'admin';
export type Category = 'hardware' | 'software' | 'network' | 'access' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export const CATEGORIES: Category[] = ['hardware', 'software', 'network', 'access', 'other'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
export const STATUSES: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  role: Role;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requester_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  author_id: string;
  body: string;
  created_at: string;
}

export interface NewTicketInput {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export const isStaff = (p: Profile | null) => !!p && (p.role === 'technician' || p.role === 'admin');
export const label = (s: string) => s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
