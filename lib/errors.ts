/** Normalizes thrown Error instances and Supabase-style `{ message }` objects. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
