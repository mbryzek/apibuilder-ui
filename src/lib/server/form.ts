/**
 * Reading a submitted field out of a form body.
 *
 * `FormData.get` returns `FormDataEntryValue | null` — a string for a text field, a `File` for a
 * file input, `null` for a field that was never submitted. Every action in this app has to narrow
 * that before it can use the value, and there were two spellings of the narrowing:
 *
 *     const guid = formData.get('guid');
 *     if (!guid || typeof guid !== 'string') { ... }        // safe
 *
 *     const email = formData.get('email') as string;
 *     if (!email) { ... }                                   // the same rule, told to the type
 *                                                           // checker as a fact it cannot check
 *
 * The cast is the problem. `as string` is false for an absent field and false for a file upload,
 * so between the read and the truthiness test the value is typed `string` while holding `null` —
 * and any code inserted in that gap, or any later edit that drops the test, is a type error the
 * compiler has been told not to report. These helpers do the narrowing once, so a call site gets
 * `string | null` and the compiler enforces the check rather than trusting it.
 *
 * They deliberately do NOT refuse the submission themselves. The wording of a refusal is the
 * action's own — "Email and password are required", "Domain name is required", "Invalid request"
 * on a hidden id the person filling in the form never sees — and flattening those into one
 * message would lose more than the duplication is worth. Each caller keeps its own `fail(...)`.
 */

/**
 * The submitted value, trimmed, or `null` when the field is absent, not a string, or blank.
 *
 * Trimming is what makes "required" mean something: a field of `'   '` is a field the person did
 * not fill in, and forwarding it to the API creates an organization named three spaces. Absent
 * and blank are therefore the same answer, and the caller refuses both the same way.
 */
export function requiredString(formData: FormData, name: string): string | null {
  return trimmedValue(formData, name) || null;
}

/**
 * The submitted value, trimmed, or `undefined` when the field is absent or blank.
 *
 * The counterpart for a field the form may legitimately leave empty. `undefined` rather than `''`
 * because the distinction the callers need is "send this to the API or omit it" — under
 * `exactOptionalPropertyTypes` an explicit `undefined` is not the same as an omitted property, so
 * a caller building a request body still writes `if (name) body.name = name`, and this is the
 * value that makes that line correct.
 */
export function optionalString(formData: FormData, name: string): string | undefined {
  return trimmedValue(formData, name) || undefined;
}

/**
 * The submitted value as one of `values`, or `null` when it is absent or is not one of them.
 *
 * Every enum field in this app is posted by a `<select>` whose options are exactly the enum, so a
 * value outside it means a hand-made request. Checking here rather than casting to the generated
 * enum keeps that request from reaching the API dressed as a valid one, and gives the call site a
 * value that is genuinely of the enum's type instead of a `string` asserted to be.
 */
export function requiredEnum<T extends string>(formData: FormData, name: string, values: readonly T[]): T | null {
  const value = trimmedValue(formData, name);
  return (values as readonly string[]).includes(value) ? (value as T) : null;
}

/**
 * The submitted value exactly as sent, or `null` when the field is absent or empty.
 *
 * The un-trimmed counterpart of `requiredString`, for a value whose surrounding whitespace is part
 * of the value rather than a typo. A password is chosen by its owner and stored as a digest of the
 * bytes submitted, so trimming one silently locks out every account whose password begins or ends
 * with a space — and does it at the login form, where there is nothing left to compare against.
 */
export function requiredSecret(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' && value ? value : null;
}

/** The trimmed text of a field, or `''` for one that is absent or is a file rather than text. */
function trimmedValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}
