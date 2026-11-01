import { describe, expect, it } from 'vitest';
import { caughtAsync } from '#lib/test-support/throws.ts';

/**
 * `PasswordResetProcessor` mails `/login/password/reset/<id>`; the form lives at
 * `/login/reset-password/<id>`. The mailed path answers by sending the browser there with the id
 * intact, and spends nothing: the id is consumed only when the form is submitted.
 */

const { load } = await import('./login/password/reset/[token]/+page.server');

describe('the mailed password-reset link', () => {
  it('sends the browser to the reset form carrying the same id', async () => {
    const thrown = await caughtAsync(() => (load as (event: unknown) => Promise<unknown>)({ params: { token: 'prs-1' } }));

    expect(thrown.status).toBe(301);
    expect(thrown.location).toBe('/login/reset-password/prs-1');
  });
});
