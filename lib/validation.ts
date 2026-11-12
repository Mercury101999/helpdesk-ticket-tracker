import { CATEGORIES, NewTicketInput, PRIORITIES } from './types';

export type TicketErrors = Partial<Record<keyof NewTicketInput, string>>;
export type AuthErrors = Partial<Record<'name' | 'email' | 'password', string>>;

/** Mirrors the CHECK constraints in the SQL migration so users get errors before a round trip. */
export function validateTicket(input: NewTicketInput): TicketErrors {
  const errors: TicketErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
  else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';
  if (description.length < 10) errors.description = 'Describe the issue in at least 10 characters.';
  if (!CATEGORIES.includes(input.category)) errors.category = 'Pick a category.';
  if (!PRIORITIES.includes(input.priority)) errors.priority = 'Pick a priority.';
  return errors;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function validateSignIn(email: string, password: string): AuthErrors {
  const errors: AuthErrors = {};
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

export function validateSignUp(name: string, email: string, password: string): AuthErrors {
  const errors: AuthErrors = {};
  if (name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

/** Mirrors the ticket_comments body CHECK (1–2000 characters). */
export function validateComment(body: string): string | undefined {
  const text = body.trim();
  if (text.length < 1) return 'Write a comment before posting.';
  if (text.length > 2000) return 'Comments must be 2,000 characters or fewer.';
  return undefined;
}
