// dry-copy: sveltekit/screen-report/endpoint — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * `/_telemetry`: where the browser half of a screen view is posted, once, by `sendBeacon`. Each app's
 * `src/routes/_telemetry/+server.ts` is one line:
 *
 *     export const POST = telemetryHandler(screenReport);
 *
 * It answers 413 over 64 KB, keeps at most 500 calls of a report, and holds browser posts to 60 a
 * minute per client address, answering 429 beyond. A Worker isolate holds its own counter, so that
 * limit stops one page looping its beacon rather than metering the fleet; the payload cap and the
 * door's token are the hard bounds. The server half never comes here: the hook forwards it in
 * process. The budget the half is stamped with is the server's, resolved from the route, and so is
 * the client round trip: Cloudflare's measure of the post's own connection.
 */
import { budgetFor } from './budget';
import { postReport, sanitizeBrowserHalf, withClientRtt } from './report';
import { clientRttOf, waitUntilOf, type ScreenReportConfig } from './server';

/** The largest browser half accepted, in bytes. */
export const MAX_REPORT_BYTES = 64 * 1024;
/** Browser posts per client address per window, per isolate. */
export const POSTS_PER_WINDOW = 60;
export const WINDOW_MS = 60_000;
/** Addresses a limiter tracks before it forgets the oldest windows. */
const MAX_TRACKED = 10_000;

/** A fixed-window count per client address. */
export class PostLimiter {
  private readonly windows = new Map<string, { startedAt: number; count: number }>();

  constructor(
    private readonly limit: number = POSTS_PER_WINDOW,
    private readonly windowMs: number = WINDOW_MS,
    private readonly clock: () => number = Date.now
  ) {}

  /** Whether one more post from `address` is admitted, counting it if so. */
  admit(address: string): boolean {
    const now = this.clock();
    const current = this.windows.get(address);
    if (current === undefined || now - current.startedAt >= this.windowMs) {
      if (current === undefined && this.windows.size >= MAX_TRACKED) this.forgetExpired(now);
      this.windows.set(address, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= this.limit) return false;
    current.count += 1;
    return true;
  }

  private forgetExpired(now: number): void {
    for (const [address, window] of this.windows) {
      if (now - window.startedAt >= this.windowMs) this.windows.delete(address);
    }
    if (this.windows.size >= MAX_TRACKED) this.windows.clear();
  }
}

/** The body, read to at most `limit` bytes; null when it is longer. */
export async function readCapped(request: Request, limit: number = MAX_REPORT_BYTES): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > limit) return null;
  if (request.body === null) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/** The fields of a request event the handler reads, declared by shape. */
export interface TelemetryEvent {
  request: Request;
  getClientAddress(): string;
  platform?: unknown;
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The `POST` of `/_telemetry`. `limiter` is per isolate: one per module instance unless a test hands its own. */
export function telemetryHandler(
  config: ScreenReportConfig,
  limiter: PostLimiter = new PostLimiter()
): (event: TelemetryEvent) => Promise<Response> {
  return async (event) => {
    const site = event.request.headers.get('sec-fetch-site');
    if (site !== null && site !== 'same-origin') return new Response(null, { status: 403 });
    if (!limiter.admit(event.getClientAddress())) return new Response(null, { status: 429 });
    const text = await readCapped(event.request);
    if (text === null) return new Response(null, { status: 413 });
    const posted = sanitizeBrowserHalf(parse(text));
    if (posted === null) return new Response(null, { status: 400 });
    const half = { ...posted, ...withClientRtt(clientRttOf(event.platform, event.request)) };
    const sent = postReport(half, budgetFor(half.route, config.budgets), config);
    const waitUntil = waitUntilOf(event.platform);
    if (waitUntil === null) await sent;
    else waitUntil(sent);
    return new Response(null, { status: 204 });
  };
}
// dry-copy-end
