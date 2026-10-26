export function normalizeHost(host) {
  return String(host || "").toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}
export function matchesStore(host, domains) {
  const current = normalizeHost(host);
  if (!current || !Array.isArray(domains)) return false;
  return domains.some((item) => {
    const domain = normalizeHost(item);
    return !!domain && (current === domain || current.endsWith("." + domain));
  });
}
export function filterOffers(offers, query, type, host, today) {
  const q = query.trim().toLocaleLowerCase("pl");
  return offers.filter((o) => !o.validUntil || o.validUntil >= today)
    .filter((o) => type === "all" || o.type === type)
    .filter((o) => [o.store, o.title, o.description, o.code || ""]
      .some((v) => String(v || "").toLocaleLowerCase("pl").includes(q)))
    .sort((a,b) => Number(matchesStore(host,b.domains)) - Number(matchesStore(host,a.domains))
      || a.store.localeCompare(b.store,"pl") || a.title.localeCompare(b.title,"pl"));
}
export function trustedSiteLink(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && url.hostname === "trendzamniej.pl" ? url.toString() : null;
  } catch { return null; }
}
