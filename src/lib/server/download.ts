/**
 * Build a `Content-Disposition: attachment` header value with a filename that cannot break out of
 * the quoted `filename="…"` token.
 *
 * Every download endpoint composes its filename from untrusted input — either upstream generator
 * output (`download`) or request path params (`original`, `service.json`), which SvelteKit decodes,
 * so `%22` arrives as a literal `"`. Strip the quote, backslash, CR/LF, and any leftover control
 * characters, and fall back to a generic name if nothing survives.
 */
export function safeContentDispositionFilename(name: string): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = name.replace(/[\r\n"\\]/g, '_').replace(/[\u0000-\u001f\u007f]/g, '');
  return cleaned.length > 0 ? cleaned : 'download.txt';
}

/** `Content-Disposition` value for an attachment with a sanitized filename. */
export function attachmentHeader(filename: string): string {
  return `attachment; filename="${safeContentDispositionFilename(filename)}"`;
}
