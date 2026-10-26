import { matchesStore } from "./logic.mjs";

// The current tab URL is compared locally. No browsing URLs are sent to the API.
const API = "https://trendzamniej.pl/api/extension/offers";
let cache = null;
let expiresAt = 0;
async function directory() {
  if (cache && Date.now() < expiresAt) return cache;
  try {
    const response = await fetch(API, { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog unavailable");
    const data = await response.json();
    if (data.version !== 2 || !Array.isArray(data.stores)) throw new Error("Unknown format");
    cache = data;
    expiresAt = Date.now() + 10 * 60 * 1000;
  } catch {
    if (!cache) return null;
  }
  return cache;
}
async function updateBadge(tabId, url) {
  if (!Number.isInteger(tabId) || tabId < 0) return;
  const clear = () => {
    chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
    chrome.action.setTitle({ tabId, title: "Trendzamniej — kody i promocje" }).catch(() => {});
  };
  let host;
  try {
    const parsed = new URL(url || "");
    if (!["https:", "http:"].includes(parsed.protocol)) { clear(); return; }
    host = parsed.hostname;
  } catch { clear(); return; }
  const data = await directory();
  if (!data) { clear(); return; }
  const store = data.stores.find(s => matchesStore(host, s.domains));
  const count = store?.offerCount || 0;
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#be123c" }).catch(() => {});
  chrome.action.setBadgeText({ tabId, text: count > 0 ? String(Math.min(count, 99)) : "" }).catch(() => {});
  chrome.action.setTitle({ tabId, title: store
    ? store.name + ": " + count + " ofert. Kliknij, aby sprawdzić kody."
    : "Trendzamniej — wyszukaj kody i promocje" }).catch(() => {});
}
chrome.tabs.onUpdated.addListener((tabId, changes, tab) => {
  if (changes.url || changes.status === "complete") void updateBadge(tabId, tab.url || changes.url);
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { const tab = await chrome.tabs.get(tabId); await updateBadge(tabId, tab.url); }
  catch { /* tab closed or inaccessible */ }
});
chrome.runtime.onInstalled.addListener(() => {
  void chrome.tabs.query({}).then(tabs => tabs.forEach(t => void updateBadge(t.id, t.url))).catch(() => {});
});
