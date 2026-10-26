import { filterOffers, matchesStore, trustedSiteLink } from "./logic.mjs";

const API = "https://trendzamniej.pl/api/extension/offers";
const $ = (id) => document.getElementById(id);
const state = { host: "", offers: [], stores: [], search: "", type: "all" };
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
  const match = matchesStore(state.host, offer.domains);
  const card = el("article", match ? "offer matched" : "offer");
  const head = el("div", "head");
  head.append(el("span", "", offer.store));
  if (match) head.append(el("span", "match", "Pasuje do strony"));
  card.append(head, el("h2", "", offer.title));
  if (offer.description) card.append(el("p", "", offer.description));
  const typeLabel = offer.type === "coupon" ? "Kupon do koszyka — sprawdź warunki"
    : offer.type === "campaign" ? "Kod kampanii — niekoniecznie rabat"
      : "Promocja bez kodu";
  card.append(el("div", "kind", typeLabel));
  if (offer.code) {
    const row = el("div", "code-row");
    const code = el("code", "", offer.code);
    const copy = el("button", "copy", "Kopiuj");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(offer.code);
        copy.textContent = "Skopiowano ✓";
      } catch { copy.textContent = "Błąd"; }
    });
    row.append(code, copy);
    card.append(row);
  }
  const link = trustedSiteLink(offer.pageUrl);
  if (link) {
    const a = el("a", "open", "Sprawdź ofertę na Trendzamniej ↗");
    a.href = link; a.target = "_blank"; a.rel = "noopener noreferrer";
    card.append(a);
  }
  return card;
}
function render() {
  const offers = filterOffers(state.offers, state.search, state.type, state.host, today);
  $("count").textContent = String(offers.length);
  const list = $("offers");
  list.replaceChildren();
  if (!offers.length) list.append(el("div", "empty", "Brak ofert pasujących do filtrów. Sprawdź inne sklepy lub wróć później."));
  offers.slice(0,100).forEach((o) => list.append(displayOffer(o)));
}
async function detectTab() {
  try {
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    const url = new URL(tab?.url || "");
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("unavailable");
    state.host = url.hostname.toLowerCase();
    $("context").textContent = "Otwarty sklep: " + state.host;
  } catch { $("context").textContent = "Wyszukuj wśród wszystkich sklepów"; }
}
async function load() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(API, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("API " + response.status);
    const data = await response.json();
    if (![1,2].includes(data.version) || !Array.isArray(data.offers)) throw new Error("Invalid API");
    state.stores = Array.isArray(data.stores) ? data.stores : [];
    state.offers = data.offers;
    $("status").textContent = "";
  } catch {
    $("status").textContent = "Nie można teraz pobrać promocji. Sprawdź połączenie lub spróbuj ponownie później.";
    state.offers = [];
  } finally { clearTimeout(id); }
  const store = state.stores.find(s => matchesStore(state.host, s.domains));
  if (store) {
    $("context").textContent = store.name + ": " + store.offerCount + " ofert · Cashback nieaktywny";
    const url = trustedSiteLink(store.pageUrl);
    if (url) {
      const link = $("store-link");
      link.href = url;
      link.hidden = false;
      link.textContent = "Zobacz wszystkie promocje " + store.name + " →";
    }
  }
  render();
}
$("search").addEventListener("input", (e) => { state.search = e.target.value; render(); });
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
await detectTab();
await load();
