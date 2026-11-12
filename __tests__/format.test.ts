import { errorMessage } from '@/lib/errors';
import { timeAgo } from '@/lib/format';
import { label } from '@/lib/types';

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats minutes, hours, and days', () => {
    expect(timeAgo('2026-06-01T12:00:00.000Z')).toBe('just now');
    expect(timeAgo('2026-06-01T11:30:00.000Z')).toBe('30m ago');
    expect(timeAgo('2026-06-01T09:00:00.000Z')).toBe('3h ago');
    expect(timeAgo('2026-05-30T12:00:00.000Z')).toBe('2d ago');
  });
});

describe('label', () => {
  it('title-cases words and replaces every underscore', () => {
    expect(label('in_progress')).toBe('In Progress');
    expect(label('urgent')).toBe('Urgent');
  });
});

describe('errorMessage', () => {
  it('reads Error instances and Supabase-style objects', () => {
    expect(errorMessage(new Error('Row level security'))).toBe('Row level security');
    expect(errorMessage({ message: 'duplicate key', code: '23505' })).toBe('duplicate key');
    expect(errorMessage(null)).toMatch(/Try again/);
    expect(errorMessage(new Error('   '), 'Saved.')).toBe('Saved.');
  });
});
