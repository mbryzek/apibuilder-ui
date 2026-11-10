// dry-copy: sveltekit/screen-report/otlp-decode — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * A protobuf reader for the tests, written from the wire format rather than from `otlp.ts`, so a
 * test reading what `encodeLogs` wrote is not the encoder agreeing with itself. Test support: the
 * `.test.` in its name keeps it out of what the package ships.
 */

interface Field {
  number: number;
  wire: number;
  value: bigint | Uint8Array;
}

function readVarint(bytes: Uint8Array, at: number): [bigint, number] {
  let result = 0n;
  let shift = 0n;
  let i = at;
  for (;;) {
    const byte = bytes[i]!;
    result |= BigInt(byte & 0x7f) << shift;
    i += 1;
    if ((byte & 0x80) === 0) return [result, i];
    shift += 7n;
  }
}

export function fields(bytes: Uint8Array): Field[] {
  const out: Field[] = [];
  let i = 0;
  while (i < bytes.length) {
    const [key, afterKey] = readVarint(bytes, i);
    const number = Number(key >> 3n);
    const wire = Number(key & 7n);
    if (wire === 0) {
      const [value, next] = readVarint(bytes, afterKey);
      out.push({ number, wire, value });
      i = next;
    } else if (wire === 1) {
      let value = 0n;
      for (let b = 7; b >= 0; b -= 1) value = (value << 8n) | BigInt(bytes[afterKey + b]!);
      out.push({ number, wire, value });
      i = afterKey + 8;
    } else if (wire === 2) {
      const [length, start] = readVarint(bytes, afterKey);
      const end = start + Number(length);
      out.push({ number, wire, value: bytes.slice(start, end) });
      i = end;
    } else {
      throw new Error(`wire type ${wire} is not one a log record uses`);
    }
  }
  return out;
}

const decoder = new TextDecoder();

function only(list: Field[], number: number): Uint8Array {
  const field = list.find((f) => f.number === number);
  if (field === undefined || !(field.value instanceof Uint8Array)) throw new Error(`no field ${number}`);
  return field.value;
}

function anyValue(bytes: Uint8Array): string | number {
  const [field] = fields(bytes);
  if (field === undefined) throw new Error('empty AnyValue');
  if (field.number === 1 && field.value instanceof Uint8Array) return decoder.decode(field.value);
  if (field.number === 3 && typeof field.value === 'bigint') return Number(BigInt.asIntN(64, field.value));
  throw new Error(`AnyValue field ${field.number}`);
}

function keyValues(list: Field[], number: number): Record<string, string | number> {
  return Object.fromEntries(
    list
      .filter((f) => f.number === number && f.value instanceof Uint8Array)
      .map((f) => {
        const kv = fields(f.value as Uint8Array);
        return [decoder.decode(only(kv, 1)), anyValue(only(kv, 2))];
      })
  );
}

/** The one record an `ExportLogsServiceRequest` holds. */
export function decodeLogs(bytes: Uint8Array): {
  resource: Record<string, string | number>;
  scope: string;
  timeUnixNano: bigint;
  severityText: string;
  body: string;
  attributes: Record<string, string | number>;
} {
  const resourceLogs = fields(only(fields(bytes), 1));
  const resource = keyValues(fields(only(resourceLogs, 1)), 1);
  const scopeLogs = fields(only(resourceLogs, 2));
  const scope = decoder.decode(only(fields(only(scopeLogs, 1)), 1));
  const record = fields(only(scopeLogs, 2));
  const time = record.find((f) => f.number === 1)?.value;
  return {
    resource,
    scope,
    timeUnixNano: typeof time === 'bigint' ? time : 0n,
    severityText: decoder.decode(only(record, 3)),
    body: String(anyValue(only(record, 5))),
    attributes: keyValues(record, 6)
  };
}
// dry-copy-end
