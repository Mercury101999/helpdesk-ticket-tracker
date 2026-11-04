import { Profile, Ticket, TicketComment } from './types';

// Local demo data used when EXPO_PUBLIC_SUPABASE_* env vars are not set.
export const MOCK_PROFILES: Profile[] = [
  { id: 'u-requester', full_name: 'Alex Rivera', email: 'alex.requester@example.com', department: 'Finance', role: 'requester' },
  { id: 'u-tech', full_name: 'Sam Chen', email: 'sam.tech@example.com', department: 'IT', role: 'technician' },
  { id: 'u-admin', full_name: 'Jordan Lee', email: 'jordan.admin@example.com', department: 'IT', role: 'admin' },
  { id: 'u-requester2', full_name: 'Priya Patel', email: 'priya@example.com', department: 'Marketing', role: 'requester' },
];

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export const MOCK_TICKETS: Ticket[] = [
  { id: 1042, title: 'Cannot connect to office Wi-Fi', description: 'Laptop sees the CORP network but 802.1X authentication fails since this morning. Wired connection works.', category: 'network', priority: 'urgent', status: 'open', requester_id: 'u-requester', assignee_id: null, created_at: ago(1), updated_at: ago(1), resolved_at: null },
  { id: 1041, title: 'Laptop will not power on', description: 'Dell Latitude 5440 shows no lights after charging overnight. Tried a different outlet.', category: 'hardware', priority: 'high', status: 'in_progress', requester_id: 'u-requester', assignee_id: 'u-tech', created_at: ago(5), updated_at: ago(3), resolved_at: null },
  { id: 1040, title: 'New hire needs AD account and email', description: 'Marketing coordinator starting Monday needs an AD account, M365 license and Teams access.', category: 'access', priority: 'medium', status: 'open', requester_id: 'u-requester2', assignee_id: 'u-admin', created_at: ago(20), updated_at: ago(20), resolved_at: null },
  { id: 1039, title: 'Request access to shared Finance drive', description: 'Need read/write access to \\\\fileserver\\finance for month-end close.', category: 'access', priority: 'medium', status: 'open', requester_id: 'u-requester', assignee_id: null, created_at: ago(26), updated_at: ago(26), resolved_at: null },
  { id: 1038, title: 'Printer on 3rd floor jamming', description: 'HP LaserJet near conference room B jams on every duplex job.', category: 'hardware', priority: 'low', status: 'in_progress', requester_id: 'u-requester2', assignee_id: 'u-tech', created_at: ago(50), updated_at: ago(30), resolved_at: null },
  { id: 1037, title: 'Excel crashes when opening macros', description: 'Excel closes without an error when enabling macros in the budget workbook.', category: 'software', priority: 'low', status: 'resolved', requester_id: 'u-requester', assignee_id: 'u-tech', created_at: ago(72), updated_at: ago(48), resolved_at: ago(48) },
  { id: 1036, title: 'VPN disconnects every 10 minutes', description: 'GlobalProtect drops the tunnel while working from home; reconnects after a minute.', category: 'network', priority: 'high', status: 'closed', requester_id: 'u-requester2', assignee_id: 'u-admin', created_at: ago(120), updated_at: ago(96), resolved_at: ago(96) },
];

export const MOCK_COMMENTS: TicketComment[] = [
  { id: 1, ticket_id: 1041, author_id: 'u-tech', body: 'Picked this up. Will swap the power adapter and drain flea power first.', created_at: ago(4) },
  { id: 2, ticket_id: 1041, author_id: 'u-requester', body: 'Thanks! It is at desk 4B whenever you are ready.', created_at: ago(3.5) },
  { id: 3, ticket_id: 1037, author_id: 'u-tech', body: 'Repaired the Office install and added the share to Trusted Locations. Please confirm.', created_at: ago(49) },
  { id: 4, ticket_id: 1037, author_id: 'u-requester', body: 'Confirmed working, thank you.', created_at: ago(48) },
];
