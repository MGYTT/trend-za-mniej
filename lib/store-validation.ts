export type StoreInput = {
  slug: string;
  name: string;
  description: string;
  domains: string[];
  websiteUrl: string;
  category: string;
  cashbackState: "unavailable" | "preparing";
  published: boolean;
};
export const isStoreSlug = (slug: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80 && slug.length >= 2;
export function validStoreDomain(host: string): boolean {
  return /^(?!-)[a-z0-9-]{1,63}(?:\.(?!-)[a-z0-9-]{1,63})+$/.test(host)
    && !host.endsWith("-") && !host.includes("-.");
}
export function normalizedStoreDomain(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}
export function websiteMatchesDomains(url: string, domains: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port ||
      parsed.search || parsed.hash) return false;
    return domains.some(domain => {
      const host = normalizedStoreDomain(parsed.hostname);
      return host === domain || host.endsWith("." + domain);
    });
  } catch { return false; }
}
export function validateStore(raw: unknown): { value: StoreInput } | { error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Nieprawidłowy formularz sklepu." };
  const row = raw as Record<string, unknown>;
  const str = (k: string) => typeof row[k] === "string" ? String(row[k]).trim() : "";
  const slug = str("slug"), name = str("name"), description = str("description");
  const category = str("category"), websiteUrl = str("websiteUrl");
  if (!isStoreSlug(slug)) return { error: "Slug: 2–80 małych liter, cyfr i myślników." };
  if (slug === "shein") return { error: "SHEIN jest obsługiwany jako istniejący sklep." };
  if (name.length < 2 || name.length > 120 || description.length > 1200 ||
    category.length < 2 || category.length > 60) return { error: "Nieprawidłowe nazwy, kategoria lub opis." };
  const rawDomains = Array.isArray(row.domains) ? row.domains : str("domains").split(/[,;\s]+/);
  if (!Array.isArray(rawDomains) || rawDomains.length < 1 || rawDomains.length > 12 ||
    !rawDomains.every(x => typeof x === "string")) return { error: "Podaj od 1 do 12 domen." };
  const domains = [...new Set(rawDomains.map(x => normalizedStoreDomain(x)))];
  if (!domains.length || !domains.every(validStoreDomain)) return { error: "Domena bez https://, np. sklep.pl." };
  if (!websiteMatchesDomains(websiteUrl, domains)) return { error: "Adres https:// musi prowadzić do wskazanej domeny sklepu." };
  if (typeof row.published !== "boolean") return { error: "Nieprawidłowy status publikacji." };
  const cashbackState = str("cashbackState");
  if (cashbackState !== "unavailable" && cashbackState !== "preparing")
    return { error: "Nie można włączyć cashbacku bez integracji rozliczeniowej." };
  return { value: { slug, name, description, domains, websiteUrl, category,
    cashbackState, published: row.published } };
}
