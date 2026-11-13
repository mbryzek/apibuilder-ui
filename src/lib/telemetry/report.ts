// dry-copy: sveltekit/screen-report/report — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * The report a screen view sends, in two halves joined on the view id, and the door both leave by.
 *
 * - The server half: the calls the server made for the first load and its later parts, forwarded in
 *   process by the server hook once the load and every later part settle (`server.ts`).
 * - The browser half: every call the browser made (a soft navigation's universal loads, later parts
 *   in the browser, each poll with its count, app endpoint calls) and the timing, posted once to the
 *   app's own `/_telemetry` when the view ends (`browser.ts`, `endpoint.ts`).
 *
 * Each half is one OTLP log record (`otlpRecord`, the attributes monitoring's rules read) posted to `obs-report.idempotent.io`, the report door, as the
 * writer whose token is the Worker secret `OBS_REPORT_TOKEN`. A browser never holds the token. The
 * budget a half is stamped with is resolved on the server from the route, never taken from a client.
 * Each half names the release its own code was built as (`screen.release`), so a rule reads a fix
 * from the views the fixed release served and no other.
 */
import { PUBLIC_VERSION } from '$app/env/public';
import type { Budget } from './budget';
import { MAX_CALLS, type RecordedCall, type ViewRecorder } from './recorder';
import { encodeLogs, type Attribute, type LogRecordInput } from './otlp';
import type { LoadPhases } from './timing';
import { isViewId } from './view';

/** The report door's OTLP logs path, admitted to the report writers alone. */
export const REPORT_ENDPOINT = 'https://obs-report.idempotent.io/insert/opentelemetry/v1/logs';

/** The poll a refresh's load calls are booked to, one tick per refresh, in both halves (`server.ts`, `browser.ts`). */
export const REFRESH_POLL = 'refresh';

/** How the browser half times a view. */
export interface ReportTiming {
  navigation: 'hard' | 'soft';
  /** Time to show; null where the browser reported nothing to time it by. */
  show_ms: number | null;
  /** Interaction to Next Paint over the view; null with no interaction before the report was sent. */
  inp_ms: number | null;
  /** Every later part rendered; null when the view ended first. */
  finished_ms: number | null;
  /**
   * Where a hard load's time went (`loadPhases`). Absent from a soft navigation, and from a half a
   * browser bundle older than the field posted.
   */
  phases?: LoadPhases;
}

/**
 * What request the server half answered: `data` is a soft navigation's data request, `refresh` a
 * data request that reloads the view the page shows (`invalidate`, the reload after a form action).
 */
export type ServerRequest = 'document' | 'data' | 'refresh' | 'form' | 'endpoint';

export interface ReportHalf {
  half: 'server' | 'browser';
  view: string;
  route: string | null;
  calls: RecordedCall[];
  /** Calls beyond the cap, counted and not carried. */
  dropped_calls: number;
  /** Ticks per poll name. */
  polls: Record<string, number>;
  /**
   * The most calls one tick made, per poll name, counted before the call cap. Absent from a half a
   * browser bundle older than the field posted; its poll peak is then read from its calls.
   */
  poll_peaks?: Record<string, number>;
  request?: ServerRequest;
  timing?: ReportTiming;
  /**
   * The round trip Cloudflare measured to the client on the request this half arrived by (the
   * document or data request for the server half, the `/_telemetry` post for the browser half).
   * Stamped on the server, never taken from a client; absent off Cloudflare.
   */
  client_rtt_ms?: number;
  /**
   * Halves this isolate failed to deliver since it last delivered one: refused, failed, or abandoned
   * with the Worker before their post was made (`LostHalves`). Stamped as the half leaves, never
   * taken from a client.
   */
  lost_halves?: number;
  /**
   * The release the half's own code was built as, the `PUBLIC_VERSION` the release bakes in: the
   * server's for the server half, the bundle's for the browser half, since a tab opened before a
   * deploy goes on running the release it loaded. Absent from a build no release made, and from a
   * half a browser bundle older than the field posted.
   */
  release?: string;
}

/** A half as it leaves for the door: stamped with the app, its repository and the budget its screen was held to. */
export interface StampedHalf extends ReportHalf {
  app: string;
  repo: string;
  budget: Budget;
}

/** The half a recorder holds now. */
export function halfOf(
  recorder: ViewRecorder,
  extra: { request?: ServerRequest; timing?: ReportTiming; client_rtt_ms?: number | null } = {}
): ReportHalf {
  return {
    half: recorder.side,
    view: recorder.view,
    route: recorder.route,
    calls: recorder.calls.map((call) => ({ ...call })),
    dropped_calls: recorder.dropped,
    polls: recorder.pollCounts(),
    poll_peaks: recorder.pollPeakCounts(),
    ...(extra.request === undefined ? {} : { request: extra.request }),
    ...(extra.timing === undefined ? {} : { timing: extra.timing }),
    ...withClientRtt(extra.client_rtt_ms),
    ...withRelease(PUBLIC_VERSION)
  };
}

/** The `client_rtt_ms` field a half carries: present only for a measured round trip. */
export function withClientRtt(rttMs: number | null | undefined): { client_rtt_ms?: number } {
  return rttMs === null || rttMs === undefined ? {} : { client_rtt_ms: rttMs };
}

/** The `release` field a half carries: present only for a release's own build. */
export function withRelease(release: unknown): { release?: string } {
  const named = text(release);
  return named === null ? {} : { release: named };
}

const MAX_TEXT = 200;
const MAX_POLLS = 50;

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT ? value : null;
}

function millis(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function status(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 100 && value <= 599 ? value : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

/** One posted call, field by field; null when it names no operation or part. */
function sanitizeCall(value: unknown): RecordedCall | null {
  const call = record(value);
  if (call === null) return null;
  const operation = text(call['operation']);
  const part = text(call['part']);
  const start = millis(call['start_ms']);
  if (operation === null || part === null || start === null) return null;
  return {
    operation,
    part,
    start_ms: start,
    end_ms: millis(call['end_ms']),
    status: status(call['status']),
    bytes: millis(call['bytes']),
    waited: call['waited'] === true,
    queries_counted: call['queries_counted'] === true
  };
}

/** A count per poll name (ticks, or one tick's peak calls), field by field. */
function sanitizePolls(value: unknown): Record<string, number> {
  const polls = record(value);
  if (polls === null) return {};
  const kept: Record<string, number> = {};
  for (const [name, count] of Object.entries(polls).slice(0, MAX_POLLS)) {
    const n = millis(count);
    if (text(name) !== null && n !== null) kept[name] = n;
  }
  return kept;
}

/** A hard load's posted phases, field by field; null where it posted none. */
function sanitizePhases(value: unknown): LoadPhases | null {
  const phases = record(value);
  if (phases === null) return null;
  return {
    wait_ms: millis(phases['wait_ms']),
    connect_ms: millis(phases['connect_ms']),
    ttfb_ms: millis(phases['ttfb_ms']),
    render_ms: millis(phases['render_ms'])
  };
}

function sanitizeTiming(value: unknown): ReportTiming | null {
  const timing = record(value);
  if (timing === null) return null;
  const navigation = timing['navigation'];
  if (navigation !== 'hard' && navigation !== 'soft') return null;
  const phases = navigation === 'hard' ? sanitizePhases(timing['phases']) : null;
  return {
    navigation,
    show_ms: millis(timing['show_ms']),
    inp_ms: millis(timing['inp_ms']),
    finished_ms: millis(timing['finished_ms']),
    ...(phases === null ? {} : { phases: phases })
  };
}

/**
 * A browser half as posted, copied field by field: the body is untrusted, so nothing in it is spread
 * and nothing it does not name survives. Calls past the cap are counted as dropped. Null when it is
 * not a browser half of a view this region minted.
 */
export function sanitizeBrowserHalf(body: unknown): ReportHalf | null {
  const half = record(body);
  if (half === null || half['half'] !== 'browser' || !isViewId(half['view'])) return null;
  const timing = sanitizeTiming(half['timing']);
  if (timing === null) return null;
  const posted = Array.isArray(half['calls']) ? half['calls'] : [];
  const calls = posted
    .slice(0, MAX_CALLS)
    .map(sanitizeCall)
    .filter((call): call is RecordedCall => call !== null);
  return {
    half: 'browser',
    view: half['view'],
    route: text(half['route']),
    calls,
    dropped_calls: (millis(half['dropped_calls']) ?? 0) + Math.max(0, posted.length - MAX_CALLS),
    polls: sanitizePolls(half['polls']),
    poll_peaks: sanitizePolls(half['poll_peaks']),
    timing,
    ...withRelease(half['release'])
  };
}

function attribute(key: string, value: string | number): Attribute {
  return { key, value: typeof value === 'number' ? Math.round(value) : value };
}

/** The most calls any one context of a part kind made: one later part, one app endpoint request, one poll tick. */
export interface PartPeaks {
  later: number;
  poll: number;
}

/** Hard for a document's view, soft for a data request's; a browser half says which itself. */
function navigationOf(half: ReportHalf): 'hard' | 'soft' | null {
  if (half.timing !== undefined) return half.timing.navigation;
  if (half.request === 'document') return 'hard';
  if (half.request === 'data') return 'soft';
  return null;
}

/**
 * The attributes monitoring's rules read (ISS-65875), dotted keys as its rules spell them. Each half
 * carries only what it made itself; a view's numbers are its two halves summed (calls, waits) or
 * maxed (later, poll, budget).
 */
export function reportAttributes(stamped: StampedHalf, peaks: PartPeaks): Attribute[] {
  const load = stamped.calls.filter((call) => call.part === 'load');
  const navigation = navigationOf(stamped);
  const timing = stamped.timing;
  const optional: [string, number | string | null | undefined][] = [
    ['screen.navigation', navigation],
    ['screen.show_ms', timing?.show_ms],
    ['screen.inp_ms', timing?.inp_ms],
    ['screen.loaded_ms', timing?.finished_ms],
    ['screen.phase.wait_ms', timing?.phases?.wait_ms],
    ['screen.phase.connect_ms', timing?.phases?.connect_ms],
    ['screen.phase.ttfb_ms', timing?.phases?.ttfb_ms],
    ['screen.phase.render_ms', timing?.phases?.render_ms],
    ['screen.client_rtt_ms', stamped.client_rtt_ms],
    ['screen.report.lost', stamped.lost_halves === 0 ? undefined : stamped.lost_halves],
    ['screen.release', stamped.release]
  ];
  return [
    attribute('screen.report', stamped.half),
    attribute('screen.repo', stamped.repo),
    attribute('screen.app', stamped.app),
    attribute('screen.route', stamped.route ?? ''),
    attribute('screen.view', stamped.view),
    ...optional.flatMap(([key, value]) => (value === null || value === undefined ? [] : [attribute(key, value)])),
    attribute('screen.load.calls', load.length),
    attribute('screen.load.waits', load.filter((call) => call.waited).length),
    attribute('screen.later.max_calls', peaks.later),
    attribute('screen.poll.max_calls', peaks.poll),
    attribute(
      'screen.poll.count',
      Object.values(stamped.polls).reduce((sum, ticks) => sum + ticks, 0)
    ),
    attribute('screen.poll.refresh.count', stamped.polls[REFRESH_POLL] ?? 0),
    ...pollTicks(stamped.polls),
    attribute('screen.calls', stamped.calls.length + stamped.dropped_calls),
    attribute('screen.budget.show_ms', stamped.budget.showMs),
    attribute('screen.budget.load.calls', stamped.budget.load.calls),
    attribute('screen.budget.load.waits', stamped.budget.load.waits),
    attribute('screen.budget.parts', stamped.budget.parts),
    attribute('screen.budget.poll', stamped.budget.poll)
  ];
}

/**
 * Each poll's ticks, as one JSON array monitoring unrolls into a row per poll
 * (`[{"poll":"status","ticks":40}]`): a named poll calls a lighter endpoint than the load, so its
 * queries are read per tick of their own, never averaged into the load's rounds, which are the first
 * load and each `refresh` tick (`screen.poll.refresh.count`). Absent from a half that ticked no poll.
 * ISS-85636
 */
function pollTicks(polls: Record<string, number>): Attribute[] {
  const ticked = Object.entries(polls)
    .filter(([, ticks]) => ticks > 0)
    .map(([poll, ticks]) => ({ poll, ticks: Math.round(ticks) }));
  return ticked.length === 0 ? [] : [attribute('screen.polls', JSON.stringify(ticked))];
}

/**
 * The peaks a sanitized browser half carries no contexts for, read from its calls: a later part or
 * endpoint is one part name. A poll's peak is the one its recorder counted per tick (`poll_peaks`),
 * which the call cap cannot shrink; a poll the half names no peak for has its tick count divide its
 * carried calls.
 */
export function peaksOfCalls(half: ReportHalf): PartPeaks {
  const byPart = new Map<string, number>();
  for (const call of half.calls) byPart.set(call.part, (byPart.get(call.part) ?? 0) + 1);
  const peaks = half.poll_peaks ?? {};
  let later = 0;
  let poll = Math.max(0, ...Object.values(peaks));
  for (const [part, count] of byPart) {
    if (part.startsWith('later:') || part.startsWith('endpoint:')) later = Math.max(later, count);
    if (part.startsWith('poll:')) {
      const name = part.slice('poll:'.length);
      if (peaks[name] !== undefined) continue;
      const ticks = Math.max(1, half.polls[name] ?? 1);
      poll = Math.max(poll, Math.ceil(count / ticks));
    }
  }
  return { later, poll };
}

/** One half as one OTLP log record: the call list is the body, the numbers rules read are attributes. */
export function otlpRecord(stamped: StampedHalf, peaks: PartPeaks, nowMs: number): LogRecordInput {
  return {
    resource: [attribute('service.name', stamped.app)],
    scope: 'screen-report',
    timeUnixMs: nowMs,
    severityNumber: 9,
    severityText: 'INFO',
    body: JSON.stringify(stamped.calls),
    attributes: reportAttributes(stamped, peaks)
  };
}

/**
 * The halves one isolate lost, carried on the next half it delivers: a send nobody saw fail is
 * invisible in the log, and a gap between the two halves of a screen view could not tell a slow
 * Worker from a lost report (ISS-77398). Counted per isolate, so a count is a floor: an isolate that
 * never delivers again takes its count with it.
 */
export class LostHalves {
  private count = 0;

  /** Count `n` halves lost. */
  lose(n = 1): void {
    this.count += n;
  }

  /** The count a half leaving now carries. */
  pending(): number {
    return this.count;
  }

  /** A half carrying `carried` was delivered: those are said, and only later losses remain. */
  said(carried: number): void {
    this.count = Math.max(0, this.count - carried);
  }
}

/** This isolate's ledger, shared by every half it posts. */
export const lostHalves = new LostHalves();

/** Where a half is posted from: the app's name, the writer's token, and the fetch to post with. */
export interface ReportDoor {
  app: string;
  /** The app's repository, full name (`mbryzek/idempotent`): a budget alert files its issue there. */
  repo: string;
  /** The Worker secret `OBS_REPORT_TOKEN`; undefined where the release set none, and nothing is posted. */
  token: () => string | undefined;
  fetch?: typeof fetch;
  endpoint?: string;
  /** Where lost halves are counted; this isolate's `lostHalves` unless a test hands its own. */
  lost?: LostHalves;
}

const POST_TIMEOUT_MS = 5_000;

/**
 * Post one stamped half to the report door as OTLP protobuf. Never throws: a failed send is dropped,
 * says so by `false`, and is counted on the next half delivered (`screen.report.lost`).
 */
export async function postReport(
  half: ReportHalf,
  budget: Budget,
  door: ReportDoor,
  peaks: PartPeaks = peaksOfCalls(half)
): Promise<boolean> {
  const lost = door.lost ?? lostHalves;
  try {
    const token = door.token();
    if (token === undefined || token === '') return false;
    const send = door.fetch ?? fetch;
    const carried = lost.pending();
    const stamped: StampedHalf = { ...half, app: door.app, repo: door.repo, budget, lost_halves: carried };
    const body = encodeLogs(otlpRecord(stamped, peaks, Date.now()));
    const response = await send(door.endpoint ?? REPORT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-protobuf', authorization: `Bearer ${token}` },
      body,
      signal: AbortSignal.timeout(POST_TIMEOUT_MS)
    });
    // A refusal from the door is a fault in the report or its writer, not in the page: it is said
    // in the app's log, where a door turning every report away is seen, and the page goes on.
    if (!response.ok) {
      console.warn(`screen report: the report door answered ${response.status}`);
      lost.lose();
      return false;
    }
    lost.said(carried);
    return true;
  } catch (error) {
    console.warn(`screen report: a ${half.half} half was not sent: ${String(error)}`);
    lost.lose();
    return false;
  }
}
// dry-copy-end
