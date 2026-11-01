import { describe, expect, it } from 'vitest';
import { optionalString, requiredEnum, requiredSecret, requiredString } from './form';

enum Visibility {
  User = 'user',
  Organization = 'organization',
  Public = 'public'
}

/** A submitted body. A `File` value stands in for a file input posted under a text field's name. */
function form(fields: Record<string, string | File>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    data.append(name, value);
  }
  return data;
}

describe('requiredString', () => {
  it('returns the submitted value', () => {
    expect(requiredString(form({ name: 'apibuilder' }), 'name')).toBe('apibuilder');
  });

  it('trims, so a field of spaces is a field nobody filled in', () => {
    expect(requiredString(form({ name: '  apibuilder  ' }), 'name')).toBe('apibuilder');
    expect(requiredString(form({ name: '   ' }), 'name')).toBeNull();
  });

  it('is null for an absent or empty field', () => {
    expect(requiredString(form({}), 'name')).toBeNull();
    expect(requiredString(form({ name: '' }), 'name')).toBeNull();
  });

  it('is null for a file posted under the name, rather than an object typed as a string', () => {
    expect(requiredString(form({ name: new File(['spec'], 'api.json') }), 'name')).toBeNull();
  });
});

describe('optionalString', () => {
  it('is undefined rather than null, so a caller can omit the property it builds', () => {
    expect(optionalString(form({}), 'key')).toBeUndefined();
    expect(optionalString(form({ key: '  ' }), 'key')).toBeUndefined();
  });

  it('returns the trimmed value when one was submitted', () => {
    expect(optionalString(form({ key: ' my-org ' }), 'key')).toBe('my-org');
  });
});

describe('requiredEnum', () => {
  const values = Object.values(Visibility);

  it('returns a value of the enum, not a string asserted to be one', () => {
    expect(requiredEnum(form({ visibility: 'public' }), 'visibility', values)).toBe(Visibility.Public);
  });

  it('is null for a value outside the enum, which never comes from the form itself', () => {
    expect(requiredEnum(form({ visibility: 'everyone' }), 'visibility', values)).toBeNull();
    expect(requiredEnum(form({ visibility: 'PUBLIC' }), 'visibility', values)).toBeNull();
  });

  it('is null for an absent field', () => {
    expect(requiredEnum(form({}), 'visibility', values)).toBeNull();
  });
});

describe('requiredSecret', () => {
  it('does not trim: the spaces around a password are part of the password', () => {
    expect(requiredSecret(form({ password: ' hunter2 ' }), 'password')).toBe(' hunter2 ');
    expect(requiredSecret(form({ password: '   ' }), 'password')).toBe('   ');
  });

  it('is null for an absent or empty field', () => {
    expect(requiredSecret(form({}), 'password')).toBeNull();
    expect(requiredSecret(form({ password: '' }), 'password')).toBeNull();
  });
});
