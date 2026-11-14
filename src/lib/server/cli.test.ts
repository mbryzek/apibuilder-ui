import { describe, expect, it } from 'vitest';
import { CLI_ORIGIN, cliResponse, isServedPath } from './cli';

function upstream(body: string, init: ResponseInit = {}) {
  const asked: string[] = [];
  const fetchFn = (async (url: string | URL | Request) => {
    asked.push(String(url));
    return new Response(body, init);
  }) as typeof fetch;
  return { asked, fetchFn };
}

describe('isServedPath', () => {
  it('serves latest and the files a release writes', () => {
    for (const path of [
      'latest',
      '0.1.2/api-darwin-arm64',
      '0.1.2/api-linux-x86_64',
      '0.1.2/api-linux-x86_64.sha256',
      '0.1.2/ApiConfig.pkl'
    ]) {
      expect(isServedPath(path)).toBe(true);
    }
  });

  it('serves nothing else the bucket holds', () => {
    for (const path of [
      '',
      '../maven-metadata.xml',
      '0.1.2/../latest',
      'com/bryzek/lib-util_3/maven-metadata.xml',
      '0.1.2/dev-darwin-arm64',
      '0.1.2/api',
      'latest/x',
      '0.1.2/ApiConfig.pkl?x'
    ]) {
      expect(isServedPath(path)).toBe(false);
    }
  });
});

describe('cliResponse', () => {
  it('reads the bucket at the same path and passes its caching on', async () => {
    const { asked, fetchFn } = upstream('0.1.2\n', { headers: { 'cache-control': 'no-cache' } });
    const response = await cliResponse('latest', fetchFn);
    expect(asked).toEqual([`${CLI_ORIGIN}/latest`]);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-cache');
    expect(await response.text()).toBe('0.1.2\n');
  });

  it('serves a binary as bytes', async () => {
    const { fetchFn } = upstream('bytes', { headers: { 'cache-control': 'public, max-age=31536000, immutable' } });
    const response = await cliResponse('0.1.2/api-darwin-arm64', fetchFn);
    expect(response.headers.get('content-type')).toBe('application/octet-stream');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });

  it('asks the bucket nothing for a path it does not serve', async () => {
    const { asked, fetchFn } = upstream('');
    expect((await cliResponse('../secret', fetchFn)).status).toBe(404);
    expect(asked).toEqual([]);
  });

  it('answers 404 for a version not published, and 502 when the bucket fails', async () => {
    expect((await cliResponse('9.9.9/ApiConfig.pkl', upstream('', { status: 404 }).fetchFn)).status).toBe(404);
    expect((await cliResponse('latest', upstream('', { status: 500 }).fetchFn)).status).toBe(502);
    const throws = (async () => {
      throw new Error('down');
    }) as typeof fetch;
    expect((await cliResponse('latest', throws)).status).toBe(502);
  });
});
