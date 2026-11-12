# Changelog

## 1.1.0 — 2026-11-12

Polish pass for the public demo. No change to the ticket workflow or the database schema.

- Light and dark themes, following the device unless the profile picks one. The choice is saved on the device. Android appearance now goes through `expo-system-ui`, which `userInterfaceStyle: automatic` needs.
- Queue status counts filter the list. Empty queues explain what to do next. Forms report every invalid field at once, and comments use the same 1–2,000 character rule as the database.
- Higher contrast badges, a visible keyboard focus ring on web, and labels on fields, filters, and ticket rows.
- Demo sign-in no longer falls back to the first mock user when the email is unknown.

## 1.0.0 — 2026-11-04

First public version: ticket queue, requester / technician / admin roles, Supabase Auth and Row Level Security, demo mode, Jest and database policy tests, GitHub Actions, and the GitHub Pages demo.
