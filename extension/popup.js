import { filterOffers, matchesStore, trustedSiteLink, trustedStoreWebsite } from "./logic.mjs";
import { showAssistantPanel } from "./assistant-overlay.mjs";
const API = "https://trendzamniej.pl/api/extension/offers";
const $ = id => document.getElementById(id);
const state = { host: "", offers: [], stores: [], search: "", type: "all", currentOnly: true, store: null };
const today = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function displayOffer(offer) {
  const matched = matchesStore(state.host, offer.domains);
  const card = el("article", matched ? "offer matched" : "offer");
  const head = el("div", "head");
  head.append(el("span", "", offer.store));
  if (matched) head.append(el("span", "match", "Otwarty sklep"));
  card.append(head, el("h2", "", offer.title));
  if (offer.description) card.append(el("p", "", offer.description));
  card.append(el("div", "kind", offer.type === "coupon" ? "Kupon do koszyka — sprawdź warunki"
    : offer.type === "campaign" ? "Kod kampanii — nie kupon" : "Promocja bez kodu"));
  if (offer.code) {
    const row = el("div", "code-row");
    const code = el("code", "", offer.code);
    const copy = el("button", "copy", "Kopiuj");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(offer.code); copy.textContent = "Skopiowano ✓"; }
      catch { copy.textContent = "Błąd kopiowania"; }
    });
    row.append(code, copy); card.append(row);
  }
  const url = trustedSiteLink(offer.pageUrl);
  if (url) {
    const a = el("a", "open", "Sprawdź ofertę na Trendzamniej ↗");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    card.append(a);
  }
  return card;
}
function filtered() {
  const offers = filterOffers(state.offers, state.search, state.type, state.host, today);
  return state.currentOnly && state.store
    ? offers.filter(o => matchesStore(state.host, o.domains)) : offers;
}
function render() {
  const offers = filtered();
  $("count").textContent = String(offers.length);
  const list = $("offers"); list.replaceChildren();
  if (!offers.length) list.append(el("div", "empty", "Brak pasujących ofert. Wyłącz filtr lub wyszukaj inne sklepy."));
  offers.slice(0, 100).forEach(o => list.append(displayOffer(o)));
}
async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab?.url || "");
  if (!tab?.id || !["https:", "http:"].includes(url.protocol)) throw new Error("Brak dostępu do tej karty.");
  return { tab, host: url.hostname.toLowerCase() };
}
async function detectTab() {
  try {
    const { host } = await activeTab();
    state.host = host;
    $("context").textContent = "Otwarta strona: " + host;
  } catch { $("context").textContent = "Przeglądaj promocje wszystkich sklepów"; }
}
async function load() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(API, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("API " + response.status);
    const data = await response.json();
    if (data.version !== 2 || !Array.isArray(data.offers) || !Array.isArray(data.stores))
      throw new Error("Nieprawidłowa odpowiedź API");
    state.stores = data.stores; state.offers = data.offers; $("status").textContent = "";
  } catch {
    $("status").textContent = "Nie można teraz pobrać promocji. Sprawdź połączenie lub otwórz katalog.";
    state.offers = []; state.stores = [];
  } finally { clearTimeout(timer); }
  state.store = state.stores.find(s => matchesStore(state.host, s.domains)) || null;
  if (state.store) {
    const store = state.store;
    $("context").textContent = store.name + ": " + store.offerCount + " ofert";
    const link = trustedSiteLink(store.pageUrl);
    if (link) {
      $("store-link").href = link; $("store-link").hidden = false;
      $("store-link").textContent = "Zobacz promocje " + store.name + " →";
    }
    const merchant = trustedStoreWebsite(store.websiteUrl, store.domains);
    if (merchant) {
      $("merchant-link").href = merchant; $("merchant-link").hidden = false;
      $("merchant-link").textContent = "Otwórz sklep " + store.name + " ↗";
    }
    $("current-only-label").hidden = false;
    $("current-only").checked = true;
    state.currentOnly = true;
    $("show-on-site").hidden = store.offerCount === 0;
  } else state.currentOnly = false;
  render();
}
$("search").addEventListener("input", e => { state.search = e.target.value; render(); });
$("current-only").addEventListener("change", e => { state.currentOnly = e.target.checked; render(); });
for (const chip of document.querySelectorAll(".chip")) {
  chip.addEventListener("click", () => {
    state.type = chip.dataset.type;
    for (const btn of document.querySelectorAll(".chip")) {
      btn.classList.toggle("selected", btn === chip);
      btn.setAttribute("aria-pressed", String(btn === chip));
    }
    render();
  });
}
$("show-on-site").addEventListener("click", async () => {
  const button = $("show-on-site");
  if (!state.store) return;
  button.disabled = true;
  try {
    const { tab, host } = await activeTab();
    if (!matchesStore(host, state.store.domains))
      throw new Error("Otwórz kartę sklepu, którego kody chcesz zobaczyć.");
    if (!String(tab.url).startsWith("https://"))
      throw new Error("Asystent działa wyłącznie na stronach HTTPS.");
    const offers = filterOffers(state.offers, "", "all", host, today)
      .filter(o => matchesStore(host, o.domains)).slice(0, 20)
      .map(o => ({ title: o.title, description: o.description, code: o.code, type: o.type }));
    await chrome.scripting.executeScript({
      target: { tabId: tab.id }, func: showAssistantPanel,
      args: [{ storeName: state.store.name, pageUrl: trustedSiteLink(state.store.pageUrl), offers }],
    });
    window.close();
  } catch (error) {
    $("status").textContent = error instanceof Error ? error.message : "Nie można otworzyć panelu na tej stronie.";
  } finally { button.disabled = false; }
});
await detectTab();
await load();
