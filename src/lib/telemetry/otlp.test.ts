// dry-copy: sveltekit/screen-report/otlp-test — every copy of this region must match; `dev repo copies` checks it (DES-65431)
import { describe, expect, it } from 'vitest';
import { encodeLogs } from './otlp';
import { decodeLogs, fields } from './otlp.test.decode';

describe('encodeLogs', () => {
  it('writes one ExportLogsServiceRequest a protobuf reader reads back field for field', () => {
    const bytes = encodeLogs({
      resource: [{ key: 'service.name', value: 'idempotent' }],
      scope: 'screen-report',
      timeUnixMs: 1_762_700_000_123,
      severityNumber: 9,
      severityText: 'INFO',
      body: '[{"operation":"getIssue"}]',
      attributes: [
        { key: 'screen.route', value: '/issues/[id]' },
        { key: 'screen.load.calls', value: 3 },
        { key: 'screen.calls', value: 300 }
      ]
    });
    expect(decodeLogs(bytes)).toEqual({
      resource: { 'service.name': 'idempotent' },
      scope: 'screen-report',
      timeUnixNano: 1_762_700_000_123_000_000n,
      severityText: 'INFO',
      body: '[{"operation":"getIssue"}]',
      attributes: { 'screen.route': '/issues/[id]', 'screen.load.calls': 3, 'screen.calls': 300 }
    });
  });

  it('writes text as UTF-8 and lengths past one varint byte', () => {
    const body = `é${'x'.repeat(300)}`;
    const bytes = encodeLogs({ resource: [], scope: 's', timeUnixMs: 0, severityNumber: 9, severityText: 'INFO', body, attributes: [] });
    expect(decodeLogs(bytes).body).toBe(body);
  });

  it('has a single top-level field, the resource logs', () => {
    const bytes = encodeLogs({
      resource: [],
      scope: 's',
      timeUnixMs: 0,
      severityNumber: 9,
      severityText: 'INFO',
      body: '',
      attributes: []
    });
    expect(fields(bytes).map((f) => [f.number, f.wire])).toEqual([[1, 2]]);
  });
});
// dry-copy-end
