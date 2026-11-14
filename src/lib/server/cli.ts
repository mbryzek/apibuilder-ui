/**
 * The public `api` CLI's downloads, served at `apibuilder.org/cli/<path>` (ISS-86630).
 *
 * Every devops release writes them under `apibuilder-cli/` in the Maven repository's R2 bucket
 * (devops `ocaml/lib/api_cli_release.ml`), and `static/install.sh` reads only this host, so
 * apibuilder.org is the one address a person is given:
 *
 *   latest                           the version install.sh installs, served no-cache
 *   <version>/api-<triple>           the binary
 *   <version>/api-<triple>.sha256    its sha256, hex
 *   <version>/ApiConfig.pkl          the DSL every `.api/config.pkl` amends
 *
 * Only those shapes reach the bucket, so no path a caller writes can read anything else it holds.
 */
export const CLI_ORIGIN = 'https://maven.bryzek.com/apibuilder-cli';

const SERVED = /^(latest|\d+\.\d+\.\d+\/(api-[a-z0-9]+-[a-z0-9_]+(\.sha256)?|ApiConfig\.pkl))$/;

export function isServedPath(path: string): boolean {
  return SERVED.test(path);
}

function contentType(path: string): string {
  if (/\/api-[^/]+$/.test(path) && !path.endsWith('.sha256')) return 'application/octet-stream';
  return 'text/plain; charset=utf-8';
}

/** The response for `/cli/<path>`: the bucket's bytes, or a plain 404 / 502. */
export async function cliResponse(path: string, fetchFn: typeof fetch = fetch): Promise<Response> {
  if (!isServedPath(path)) return new Response('Not found\n', { status: 404 });
  let upstream: Response;
  try {
    upstream = await fetchFn(`${CLI_ORIGIN}/${path}`);
  } catch {
    return new Response('The api CLI download could not be reached\n', { status: 502 });
  }
  if (upstream.status === 404) return new Response('Not found\n', { status: 404 });
  if (!upstream.ok) return new Response('The api CLI download could not be reached\n', { status: 502 });
  const headers = new Headers({ 'content-type': contentType(path) });
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) headers.set('cache-control', cacheControl);
  const length = upstream.headers.get('content-length');
  if (length) headers.set('content-length', length);
  return new Response(upstream.body, { status: 200, headers });
}
