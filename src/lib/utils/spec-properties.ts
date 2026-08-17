/**
 * A row of the one table that renders both a model's fields and an operation's parameters.
 *
 * `Field` and `Parameter` satisfy this structurally, so nothing maps into it: the two differ only
 * in `location`, which a parameter carries and a field does not.
 */
export interface PropertyRow {
  name: string;
  type: string;
  required: boolean;
  /** Where a parameter is carried — `Path`, `Query`, `Form`. Absent on a field. */
  location?: string;
  default?: string;
  minimum?: number;
  maximum?: number;
  description?: string;
  example?: string;
}

/**
 * Which part of the details column a piece of text is, so the table can style it. Everything but
 * `description` is a small grey aside; `location` is a chip.
 */
export type PropertyDetailKind = 'location' | 'default' | 'range' | 'description' | 'example';

export interface PropertyDetail {
  kind: PropertyDetailKind;
  text: string;
}

/**
 * `null` as well as `undefined`, because these rows are parsed from stored service JSON rather
 * than constructed here — an explicit null would otherwise render as `min: null`.
 */
function present<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

function rangeText(row: PropertyRow): string | null {
  const parts: string[] = [];
  if (present(row.minimum)) parts.push(`min: ${row.minimum}`);
  if (present(row.maximum)) parts.push(`max: ${row.maximum}`);
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Everything the details column says about one row, in render order.
 *
 * A `default` of `''` and a `minimum` of `0` are both real values a spec can declare, so presence
 * is tested rather than truthiness. `description` and `example` are free text where an empty
 * string carries nothing, and are tested for truth.
 */
export function propertyDetails(row: PropertyRow): PropertyDetail[] {
  const details: PropertyDetail[] = [];
  if (present(row.location)) details.push({ kind: 'location', text: row.location });
  if (present(row.default)) details.push({ kind: 'default', text: `default: ${row.default}` });
  const range = rangeText(row);
  if (range !== null) details.push({ kind: 'range', text: range });
  if (row.description) details.push({ kind: 'description', text: row.description });
  if (row.example) details.push({ kind: 'example', text: `e.g. ${row.example}` });
  return details;
}

/**
 * Whether the details column is worth a column at all.
 *
 * `location` is required on a parameter, so an operation's parameters always answer true — the
 * always-on column parameters had is now a consequence of this one predicate rather than a second
 * rule maintained beside it.
 */
export function anyPropertyDetails(rows: PropertyRow[]): boolean {
  return rows.some((row) => propertyDetails(row).length > 0);
}
