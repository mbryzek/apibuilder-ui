import { describe, expect, it } from 'vitest';
import type { User } from '#generated/com-bryzek-platform.ts';
import { displayName, initials } from './account';

function user(person: { name?: string; email?: string }): User {
  return {
    person: { name: person.name, email: person.email ? { address: person.email } : undefined }
  } as unknown as User;
}

describe('initials', () => {
  it('takes the first letters of the first and last word', () => {
    expect(initials('Ada Byron Lovelace')).toBe('AL');
  });

  it('takes the first two letters of a one-word name', () => {
    expect(initials('ada@example.com')).toBe('AD');
  });

  it('answers a placeholder for an empty name', () => {
    expect(initials('   ')).toBe('?');
  });
});

describe('displayName', () => {
  it('prefers the name', () => {
    expect(displayName(user({ name: ' Ada Lovelace ', email: 'ada@example.com' }))).toBe('Ada Lovelace');
  });

  it('falls back to the email when there is no name', () => {
    expect(displayName(user({ name: '  ', email: 'ada@example.com' }))).toBe('ada@example.com');
  });
});
