import { isValidEmail, validateComment, validateSignIn, validateSignUp, validateTicket } from '@/lib/validation';
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

describe('validateSignIn', () => {
  it('reports email and password together', () => {
    expect(validateSignIn('not-an-email', 'short')).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password must be at least 6 characters.',
    });
  });

  it('accepts a usable sign-in', () => {
    expect(validateSignIn(' sam@example.com ', 'secret')).toEqual({});
  });
});

describe('validateSignUp', () => {
  it('requires a name, a real email, and 8 characters', () => {
    expect(Object.keys(validateSignUp('A', 'nope', 'short')).sort()).toEqual(['email', 'name', 'password']);
  });

  it('accepts a complete sign-up', () => {
    expect(validateSignUp('Ada Lovelace', 'ada@example.com', 'long-enough')).toEqual({});
  });
});

describe('validateComment', () => {
  it('requires text and caps the length at the database check', () => {
    expect(validateComment('   ')).toMatch(/before posting/);
    expect(validateComment('x'.repeat(2001))).toMatch(/2,000/);
    expect(validateComment('  Adapter swapped.  ')).toBeUndefined();
    expect(validateComment('x'.repeat(2000))).toBeUndefined();
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', ' jack@example.com '])('accepts %p', (e) => expect(isValidEmail(e)).toBe(true));
  it.each(['', 'jack', 'jack@', 'jack@example', 'ja ck@example.com'])('rejects %p', (e) => expect(isValidEmail(e)).toBe(false));
});
