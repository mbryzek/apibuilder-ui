// dry-copy: sveltekit/screen-report/otlp — every copy of this region must match; `dev repo copies` checks it (DES-65431)
/**
 * One OTLP log record, encoded as the protobuf `ExportLogsServiceRequest` the report door's
 * `/insert/opentelemetry/v1/logs` reads (`Content-Type: application/x-protobuf`).
 *
 * Protobuf rather than OTLP/JSON because protobuf is the encoding every OTLP receiver accepts, and
 * the in-cluster collector already sends it to the same VictoriaLogs. The messages are small and
 * fixed, so this writes the few fields a report uses by hand rather than taking a protobuf runtime
 * into every app's bundle:
 *
 *     ExportLogsServiceRequest { 1: ResourceLogs }
 *     ResourceLogs  { 1: Resource { 1: KeyValue... }, 2: ScopeLogs }
 *     ScopeLogs     { 1: InstrumentationScope { 1: name }, 2: LogRecord }
 *     LogRecord     { 1: time_unix_nano fixed64, 2: severity_number, 3: severity_text,
 *                     5: body AnyValue, 6: KeyValue..., 11: observed_time_unix_nano fixed64 }
 *     KeyValue      { 1: key, 2: AnyValue }
 *     AnyValue      { 1: string_value | 3: int_value }
 */

export type AttributeValue = string | number;

export interface Attribute {
  key: string;
  value: AttributeValue;
}

/** What one record holds. */
export interface LogRecordInput {
  resource: Attribute[];
  scope: string;
  timeUnixMs: number;
  severityNumber: number;
  severityText: string;
  body: string;
  attributes: Attribute[];
}

const VARINT = 0;
const FIXED64 = 1;
const LENGTH_DELIMITED = 2;

const encoder = new TextEncoder();

/** A non-negative integer as a base-128 varint; a negative one as its two's-complement 64-bit form. */
function varint(value: number | bigint): number[] {
  let rest = BigInt.asUintN(64, BigInt(value));
  const bytes: number[] = [];
  while (rest >= 0x80n) {
    bytes.push(Number(rest & 0x7fn) | 0x80);
    rest >>= 7n;
  }
  bytes.push(Number(rest));
  return bytes;
}

function tag(field: number, wire: number): number[] {
  return varint((field << 3) | wire);
}

function bytesField(field: number, bytes: Uint8Array | number[]): number[] {
  return [...tag(field, LENGTH_DELIMITED), ...varint(bytes.length), ...bytes];
}

function stringField(field: number, value: string): number[] {
  return bytesField(field, encoder.encode(value));
}

function varintField(field: number, value: number | bigint): number[] {
  return [...tag(field, VARINT), ...varint(value)];
}

function fixed64Field(field: number, value: bigint): number[] {
  const bytes: number[] = [];
  let rest = BigInt.asUintN(64, value);
  for (let i = 0; i < 8; i += 1) {
    bytes.push(Number(rest & 0xffn));
    rest >>= 8n;
  }
  return [...tag(field, FIXED64), ...bytes];
}

function anyValue(value: AttributeValue): number[] {
  return typeof value === 'number' ? varintField(3, Math.round(value)) : stringField(1, value);
}

function keyValue(attribute: Attribute): number[] {
  return [...stringField(1, attribute.key), ...bytesField(2, anyValue(attribute.value))];
}

function logRecord(input: LogRecordInput): number[] {
  const nanos = BigInt(Math.round(input.timeUnixMs)) * 1_000_000n;
  return [
    ...fixed64Field(1, nanos),
    ...varintField(2, input.severityNumber),
    ...stringField(3, input.severityText),
    ...bytesField(5, anyValue(input.body)),
    ...input.attributes.flatMap((attribute) => bytesField(6, keyValue(attribute))),
    ...fixed64Field(11, nanos)
  ];
}

/** The request body for one record. */
export function encodeLogs(input: LogRecordInput): Uint8Array<ArrayBuffer> {
  const resource = input.resource.flatMap((attribute) => bytesField(1, keyValue(attribute)));
  const scopeLogs = [...bytesField(1, stringField(1, input.scope)), ...bytesField(2, logRecord(input))];
  const resourceLogs = [...bytesField(1, resource), ...bytesField(2, scopeLogs)];
  return Uint8Array.from(bytesField(1, resourceLogs));
}
// dry-copy-end
