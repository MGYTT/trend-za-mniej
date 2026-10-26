/**
 * Injected ONLY on explicit click in extension popup.
 * No cart access, no automatic coupon trial, no affiliate rewrites.
 * Self-contained for chrome.scripting.executeScript serialization.
 */
export function showAssistantPanel(payload) {
  const id = "trendzamniej-offer-assistant";
  const old = document.getElementById(id);
  if (old) old.remove();
  if (!payload || typeof payload !== "object") return;
  const name = typeof payload.storeName === "string" ? payload.storeName.slice(0, 120) : "Sklep";
  const offers = Array.isArray(payload.offers) ? payload.offers.slice(0, 20) : [];
  const root = document.createElement("div");
  root.id = id;
  root.style.cssText = "position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;max-width:calc(100vw - 32px)!important;";
  const shadow = root.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent =
    ":host{color-scheme:light;font-family:Arial,Helvetica,sans-serif}"+
    "*{box-sizing:border-box}"+
    ".wrap{width:min(380px,calc(100vw - 32px));max-height:min(570px,calc(100vh - 48px));display:flex;flex-direction:column;overflow:hidden;color:#292524;background:white;border:1px solid #fecdd3;border-radius:18px;box-shadow:0 16px 55px #1c191780}"+
    ".head{background:#fff1f2;display:flex;padding:14px;align-items:center;gap:12px}"+
    ".head strong{display:block;font-size:15px;color:#881337}"+
    ".head small{display:block;font-size:12px;color:#57534e;margin-top:4px}"+
    ".close{margin-left:auto;border:0;border-radius:8px;cursor:pointer;background:white;font-size:21px;color:#881337;width:35px;height:35px}"+
    ".list{overflow-y:auto;padding:13px}.card{border:1px solid #e7e5e4;border-radius:11px;margin-bottom:9px;padding:12px}"+
    ".badge{color:#be123c;font-size:11px;font-weight:700}"+
    ".title{margin:6px 0;color:#292524;font-size:14px;font-weight:700;line-height:1.4}"+
    ".desc{margin:0;font-size:12px;color:#57534e;line-height:1.5}"+
    ".copy{background:#881337;border:0;border-radius:8px;padding:9px 11px;margin-top:9px;color:white;cursor:pointer;font-size:12px;font-weight:700;max-width:100%;overflow-wrap:anywhere}"+
    ".foot{padding:12px 15px;background:#fafaf9;font-size:11px;line-height:1.5;color:#57534e}"+
    ".foot a{display:inline-block;margin-top:6px;font-weight:700;color:#9f1239}"+
    ".empty{padding:16px;font-size:13px;color:#57534e}";
  const wrap = document.createElement("section");
  wrap.className = "wrap";
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", "Kody i promocje Trendzamniej");
  const head = document.createElement("div");
  head.className = "head";
  const heading = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = "Trendzamniej — " + name;
  const subtitle = document.createElement("small");
  subtitle.textContent = offers.length + (offers.length === 1 ? " oferta" : " ofert") + " • tylko na Twoje polecenie";
  heading.append(title, subtitle);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.setAttribute("aria-label", "Zamknij asystenta promocji");
  close.textContent = "×";
  const onEscape = event => { if (event.key === "Escape") cleanup(); };
  function cleanup() { document.removeEventListener("keydown", onEscape); root.remove(); }
  close.addEventListener("click", cleanup);
  head.append(heading, close);
  wrap.append(head);
  const list = document.createElement("div");
  list.className = "list";
  if (!offers.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Nie mamy obecnie zweryfikowanych ofert dla tego sklepu.";
    list.append(p);
  }
  for (const offer of offers) {
    if (!offer || typeof offer !== "object") continue;
    const card = document.createElement("div");
    card.className = "card";
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = offer.type === "coupon" ? "Kupon do koszyka — sprawdź warunki"
      : offer.type === "campaign" ? "Kod kampanii — nie kupon" : "Promocja";
    const label = document.createElement("p");
    label.className = "title";
    label.textContent = String(offer.title || "Oferta").slice(0, 190);
    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = String(offer.description || "").slice(0, 450);
    card.append(badge, label, desc);
    if (typeof offer.code === "string" && offer.code.length > 0 && offer.code.length <= 90) {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "copy";
      copy.textContent = "Kopiuj: " + offer.code;
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(offer.code); copy.textContent = "Skopiowano ✓"; }
        catch { copy.textContent = "Nie udało się skopiować"; }
      });
      card.append(copy);
    }
    list.append(card);
  }
  wrap.append(list);
  const foot = document.createElement("div");
  foot.className = "foot";
  foot.textContent = "Kody nie są testowane automatycznie w koszyku. Sprawdź warunki u sprzedawcy. ";
  try {
    const url = new URL(payload.pageUrl);
    if (url.protocol === "https:" && url.hostname === "trendzamniej.pl") {
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Wszystkie oferty na Trendzamniej ↗";
      foot.append(link);
    }
  } catch { /* invalid URL */ }
  wrap.append(foot);
  shadow.append(style, wrap);
  document.documentElement.append(root);
  document.addEventListener("keydown", onEscape);
  close.focus();
}
