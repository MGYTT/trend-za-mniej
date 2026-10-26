/** Validate a DIRECT merchant destination; third-party tracking redirects need a separate approved integration. */
export function merchantDestination(raw: string | null | undefined, domains: string[]): string | null {
  if (typeof raw !== "string" || !raw.trim() || raw.length > 2000) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
        !Array.isArray(domains) || domains.length === 0) return null;
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
    const valid = domains.some(rawDomain => {
      const domain = String(rawDomain).toLowerCase().replace(/^www\./, "");
      return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain) &&
        (hostname === domain || hostname.endsWith("." + domain));
    });
    return valid ? url.href : null;
  } catch { return null; }
}
