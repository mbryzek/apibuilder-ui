import { describe, expect, it } from 'vitest';
import type { Operation } from '$generated/com-bryzek-apibuilder-spec';
import { operationAuthBadge, operationContentTypeBadge } from './operation-badges';
import { operation, service } from '$lib/test-support/fixtures';

const svc = service({ auth_schemes: [{ type: 'hackathon_admin', attributes: {} }] });

describe('operationAuthBadge', () => {
  it('links a protected operation to the scheme card that says what the scheme is', () => {
    expect(operationAuthBadge(operation({ auth: 'hackathon_admin' }), svc)).toEqual({
      kind: 'protected',
      label: 'auth: hackathon_admin',
      href: '#auth-scheme-hackathon_admin',
      title: 'Requires the hackathon_admin auth scheme.'
    });
  });

  it('marks an undeclared scheme in the label, without a link that would go nowhere', () => {
    // The spec requires every `auth` value to be declared, so this is a broken service. The
    // label carries that rather than the title alone: a title is unreachable on touch and
    // invisible to a screen reader, which would leave the badge's colour as the whole signal.
    const badge = operationAuthBadge(operation({ auth: 'admin' }), svc);
    expect(badge?.kind).toBe('undeclared');
    expect(badge?.label).toBe('auth: admin (undeclared)');
    expect(badge?.href).toBeNull();
    expect(badge?.title).toContain('does not declare');
  });

  it('marks the reserved `none` value explicitly public', () => {
    // Worth a badge of its own: `none` is how one operation opts out of a protected resource.
    const badge = operationAuthBadge(operation({ auth: 'none' }), svc);
    expect(badge?.kind).toBe('public');
    expect(badge?.label).toBe('public');
    expect(badge?.href).toBeNull();
  });

  it('renders nothing when the field is absent', () => {
    // Every operation of every service uploaded before `auth` existed is in this state; a
    // "public" chip on all of them would distinguish nothing.
    expect(operationAuthBadge(operation(), svc)).toBeNull();
  });

  it('treats a blank value as absent rather than as a scheme named ""', () => {
    expect(operationAuthBadge(operation({ auth: '   ' }), svc)).toBeNull();
  });
});

describe('operationContentTypeBadge', () => {
  it('says nothing about the default', () => {
    expect(operationContentTypeBadge(operation({ content_type: 'application/json' }))).toBeNull();
  });

  it('surfaces an override, which is the case a client author has to handle', () => {
    expect(operationContentTypeBadge(operation({ content_type: 'application/octet-stream' }))).toBe('application/octet-stream');
  });

  it('does not call a differently-cased default an override', () => {
    expect(operationContentTypeBadge(operation({ content_type: 'Application/JSON' }))).toBeNull();
  });

  it('keeps the value as written when it is an override', () => {
    // Only the comparison is case-insensitive: a header value is echoed, not normalized.
    expect(operationContentTypeBadge(operation({ content_type: ' multipart/form-data ' }))).toBe('multipart/form-data');
  });

  it('renders nothing for stored JSON that predates the field', () => {
    const legacy = operation();
    delete (legacy as Partial<Operation>).content_type;
    expect(operationContentTypeBadge(legacy)).toBeNull();
  });
});
