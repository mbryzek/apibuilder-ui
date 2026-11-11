import { describe, expect, it } from 'vitest';
import { answer, anything, emptyAnswer, layoutsOf, noting } from './screenBudget.ts';

type Rows = { length: number; [Symbol.iterator](): Iterator<unknown> };

describe('emptyAnswer', () => {
  it('answers every list, at any depth, with no rows', async () => {
    const body = (await emptyAnswer()('https://apibuilder.org/apicollective/applications').json()) as unknown[] & { versions: Rows };
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
    expect(body.versions.length).toBe(0);
    expect([...body.versions]).toEqual([]);
    expect((body.versions as unknown as { items: Rows }).items.length).toBe(0);
  });

  it('answers the calls the layouts made as the full run does', async () => {
    const shell = new Set<string>();
    await noting(answer, shell)('https://apibuilder.org/organizations?key=apicollective');
    const respond = emptyAnswer(shell);
    expect(await respond('https://apibuilder.org/organizations?key=apicollective').json()).toHaveLength(2);
    expect(await respond('https://apibuilder.org/organizations?key=other').json()).toHaveLength(0);
    expect(await respond('https://apibuilder.org/apicollective/applications').json()).toHaveLength(0);
  });
});

describe('anything', () => {
  it('is a two-row list by default, and so is every list read off it', () => {
    const value = anything() as { versions: Rows };
    expect(value.versions.length).toBe(2);
    expect([...value.versions]).toHaveLength(2);
  });
});

describe('layoutsOf', () => {
  it('drops the page level', () => {
    const page = { server: { load: () => ({}) } };
    const layout = { server: { load: () => ({}) } };
    expect(layoutsOf({ route: '/[orgKey]', levels: [layout, page] }).levels).toEqual([layout]);
  });
});
