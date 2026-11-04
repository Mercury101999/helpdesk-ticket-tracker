import { CATEGORIES, NewTicketInput, PRIORITIES } from './types';

export type TicketErrors = Partial<Record<keyof NewTicketInput, string>>;

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
