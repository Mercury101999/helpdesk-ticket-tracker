import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Smoke-tests the Supabase migration + RLS policies in an in-memory Postgres (PGlite).
// A tiny stub stands in for Supabase's auth schema; auth.uid() reads a session setting.
const STUB = `create extension pgcrypto;
create role authenticated; create role anon;
create schema auth;
create table auth.users (instance_id uuid, id uuid primary key, aud text, role text, email text, encrypted_password text,
  email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant usage on schema auth, public to authenticated; grant execute on function auth.uid() to authenticated;
`;
const db = new PGlite({ extensions: { pgcrypto } });
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'supabase') + '/';
const mig = fs.readdirSync(R+'migrations').map(f=>fs.readFileSync(R+'migrations/'+f,'utf8')).join('\n');
await db.exec(STUB); await db.exec(mig); await db.exec(fs.readFileSync(R+'seed.sql','utf8'));
console.log('migration + seed OK');
const REQ="'11111111-1111-1111-1111-111111111111'", TECH="'22222222-2222-2222-2222-222222222222'";
const steps = [
 "grant all on all tables in schema public to authenticated",
 "set role authenticated",
 `set request.jwt.claim.sub = ${REQ}`,
 "select 'requester sees' k, count(*) from tickets",
 "insert into tickets (title, description, category, priority) values ('Mouse broken', 'Left click stopped working', 'hardware','low') returning id, requester_id",
 "select 'requester sees' k, count(*) from tickets",
 "update tickets set status='closed' where title='Mouse broken'  -- EXPECT ERROR",
 "update profiles set role='admin' where id=auth.uid()  -- EXPECT ERROR",
 `insert into tickets (title, description, requester_id) values ('Spoof ticket', 'for someone else entirely', ${TECH})  -- EXPECT ERROR`,
 `set request.jwt.claim.sub = ${TECH}`,
 "select 'tech sees' k, count(*) from tickets",
 "update tickets set status='resolved', assignee_id=auth.uid() where title='Mouse broken' returning status, resolved_at is not null as resolved_set",
 "select 'comments visible to tech' k, count(*) from ticket_comments",
 "insert into tickets (title, description) values ('Tech own ticket', 'Server room AC alarm going off') returning id",
 `set request.jwt.claim.sub = ${REQ}`,
 "select 'requester still sees only own (expect 5)' k, count(*) from tickets",
 "select 1/(case when count(*) = 0 then 1 else 0 end) from tickets where title = 'Tech own ticket'  -- isolation: errors if visible",
];
let failed = 0;
for (const q of steps) {
  const expectError = q.includes('EXPECT ERROR');
  try {
    const r = await db.query(q);
    if (expectError) { failed++; console.log('FAIL (should have been blocked):', q); }
    else console.log('ok  ', q.slice(0, 70), r.rows.length ? JSON.stringify(r.rows) : '');
  } catch (e) {
    if (expectError) console.log('ok   blocked:', q.slice(0, 60), '=>', e.message);
    else { failed++; console.log('FAIL', q, '=>', e.message); }
  }
}
process.exit(failed ? 1 : 0);
