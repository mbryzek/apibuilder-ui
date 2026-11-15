// dry-copy: sveltekit/screen-budget/query-params-test — every copy of this region must match; `dev repo copies` checks it (ISS-80720)
import { describe, expect, it } from 'vitest';
import { readingUrl, unsetParameters, unsetParametersMessage } from './screenQuery.ts';

describe('readingUrl', () => {
  it('notes each name read by get, getAll and has', () => {
    const { url, read } = readingUrl(new URL('http://localhost/admin/chat?chat=1'));
    expect(url.searchParams.get('chat')).toBe('1');
    expect(url.searchParams.getAll('tag')).toEqual([]);
    expect(url.searchParams.has('q')).toBe(false);
    expect([...read].sort()).toEqual(['chat', 'q', 'tag']);
  });

  it('notes every carried name when the parameters are enumerated', () => {
    for (const enumerate of [
      (p: URLSearchParams) => [...p.entries()],
      (p: URLSearchParams) => [...p.keys()],
      (p: URLSearchParams) => [...p.values()],
      (p: URLSearchParams) => p.forEach(() => undefined),
      (p: URLSearchParams) => p.toString(),
      (p: URLSearchParams) => p.size,
      (p: URLSearchParams) => [...p],
      (p: URLSearchParams) => Object.fromEntries(p)
    ]) {
      const { url, read } = readingUrl(new URL('http://localhost/x?a=1&b=2'));
      enumerate(url.searchParams);
      expect([...read].sort()).toEqual(['a', 'b']);
    }
  });

  it('reads nothing until a load asks', () => {
    const { url, read } = readingUrl(new URL('http://localhost/x?a=1'));
    expect(url.pathname).toBe('/x');
    expect(url.href).toBe('http://localhost/x?a=1');
    expect(url).toBeInstanceOf(URL);
    expect(read.size).toBe(0);
  });

  it('answers what a plain URL answers', () => {
    const { url } = readingUrl(new URL('http://localhost/x?a=1&a=2'));
    expect(url.searchParams.getAll('a')).toEqual(['1', '2']);
    expect(new URL(url).searchParams.get('a')).toBe('1');
    expect(String(url)).toBe('http://localhost/x?a=1&a=2');
  });
});

describe('unsetParameters', () => {
  it('names each parameter read that the URL does not carry, sorted', () => {
    expect(unsetParameters(['q', 'chat', 'page'], new URL('http://localhost/x?page=2'))).toEqual(['chat', 'q']);
  });

  it('leaves out a parameter the route reads on purpose with no value', () => {
    expect(unsetParameters(['q', 'chat'], new URL('http://localhost/x'), ['q'])).toEqual(['chat']);
  });

  it('counts a parameter carried with an empty value as carried', () => {
    expect(unsetParameters(['q'], new URL('http://localhost/x?q='))).toEqual([]);
  });

  it('does not itself read through a reading URL', () => {
    const { url, read } = readingUrl(new URL('http://localhost/x?a=1'));
    url.searchParams.get('b');
    expect(unsetParameters(read, url)).toEqual(['b']);
    expect([...read]).toEqual(['b']);
  });

  it('tells the route how to declare what it read', () => {
    expect(unsetParametersMessage('/admin/chat', ['chat'], 'budgetStub.ts')).toContain('/admin/chat reads the query parameter chat');
    expect(unsetParametersMessage('/admin/chat', ['chat'], 'budgetStub.ts')).toContain('bareParams');
  });
});
// dry-copy-end
