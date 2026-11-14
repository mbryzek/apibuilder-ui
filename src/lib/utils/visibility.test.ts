import { describe, expect, it } from 'vitest';
import { Visibility } from '#generated/com-bryzek-apibuilder.ts';
import { OFFERED_VISIBILITIES } from './visibility.ts';

describe('OFFERED_VISIBILITIES', () => {
  it('offers organization and public', () => {
    expect(OFFERED_VISIBILITIES).toEqual([Visibility.Organization, Visibility.Public]);
  });
});
