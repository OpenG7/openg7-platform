/**
 * Contexte : Used by notification and logging utilities before injecting user-provided snippets into HTML templates.
 * Raison d’être : Performs minimal HTML escaping to mitigate XSS when a safer rendering pipeline is unavailable.
 * @param value Raw string that may contain HTML-sensitive characters.
 * @returns Escaped string suitable for safe text interpolation.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
