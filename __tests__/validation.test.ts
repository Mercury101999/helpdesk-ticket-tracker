import { isValidEmail, validateTicket } from '@/lib/validation';
import { NewTicketInput } from '@/lib/types';

const valid: NewTicketInput = {
  title: 'VPN keeps dropping',
  description: 'Disconnects every ten minutes when working from home.',
  category: 'network',
  priority: 'high',
};

describe('validateTicket', () => {
  it('accepts a valid ticket', () => {
    expect(validateTicket(valid)).toEqual({});
  });

  it('requires a title of at least 5 characters (trimmed)', () => {
    expect(validateTicket({ ...valid, title: '  ab  ' }).title).toMatch(/at least 5/);
  });

  it('rejects titles over 120 characters', () => {
    expect(validateTicket({ ...valid, title: 'x'.repeat(121) }).title).toMatch(/120/);
    expect(validateTicket({ ...valid, title: 'x'.repeat(120) }).title).toBeUndefined();
  });

  it('requires a description of at least 10 characters', () => {
    expect(validateTicket({ ...valid, description: 'broken' }).description).toBeDefined();
  });

  it('rejects unknown category and priority values', () => {
    const errors = validateTicket({ ...valid, category: 'printer' as never, priority: 'asap' as never });
    expect(errors.category).toBeDefined();
    expect(errors.priority).toBeDefined();
  });

  it('reports every invalid field at once', () => {
    expect(Object.keys(validateTicket({ ...valid, title: '', description: '' })).sort()).toEqual(['description', 'title']);
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', ' jack@example.com '])('accepts %p', (e) => expect(isValidEmail(e)).toBe(true));
  it.each(['', 'jack', 'jack@', 'jack@example', 'ja ck@example.com'])('rejects %p', (e) => expect(isValidEmail(e)).toBe(false));
});
