import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OFFER_IMPORT_HEADER, MAX_IMPORT_ROWS, offerDraftFingerprint, parseOfferDraftTable,
} from "../lib/offer-draft-import.ts";
import { validateExtensionOffer } from "../lib/extension-offer-validation.ts";
import { merchantDestination } from "../lib/store-destination.ts";
const read = path => readFileSync(new URL(path, import.meta.url), "utf8");

test("imports semicolon CSV with quoted fields and spreadsheet TSV", () => {
  const csv = OFFER_IMPORT_HEADER + "\n" +
    'zalando;"Promocja; w sklepie";"Warunki ""tylko teraz""; weryfikuj";promotion;;2026-11-02;https://www.zalando.pl/kobiety-promocja/\r\n' +
    'modivo;Nowy kupon dla sklepu;Sprawdzony rabat dla wybranych produktów;coupon;KOD10;2026-11-10;';
  const parsed = parseOfferDraftTable(csv);
  assert.ok("rows" in parsed, JSON.stringify(parsed));
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].title, "Promocja; w sklepie");
  assert.equal(parsed.rows[0].description, 'Warunki "tylko teraz"; weryfikuj');
  assert.equal(parsed.rows[0].code, null);
  assert.equal(parsed.rows[0].validUntil, "2026-11-02");
  assert.equal(parsed.rows[1].code, "KOD10");

  const tsv = OFFER_IMPORT_HEADER.replaceAll(";", "\t") + "\n" +
    "eobuwie\tPrzecenione obuwie\tOficjalny dział wyprzedaży\tpromotion\t\t\t";
  const tabbed = parseOfferDraftTable(tsv);
  assert.ok("rows" in tabbed, JSON.stringify(tabbed));
  assert.equal(tabbed.rows[0].storeSlug, "eobuwie");
  assert.equal(tabbed.rows[0].validUntil, null);
});

test("CSV parser rejects truncated, malformed and oversized input", () => {
  const failures = [
    "", OFFER_IMPORT_HEADER, "sklep;tytul;opis", OFFER_IMPORT_HEADER + "\nzalando;Za mało;",
    OFFER_IMPORT_HEADER + '\nzalando;"Brak zamknięcia;warunki;promotion;;;',
    OFFER_IMPORT_HEADER + '\nzalando;Błędny " cudzysłów;Opis;promotion;;;',
    OFFER_IMPORT_HEADER + "\n" + Array.from({ length: MAX_IMPORT_ROWS + 1 },
      (_, i) => "zalando;Przecena numer " + (i + 1) + ";Warunki;promotion;;;").join("\n"),
    "x".repeat(32001),
  ];
  for (const input of failures)
    assert.ok("error" in parseOfferDraftTable(input), input.slice(0, 65));
});

test("duplicate fingerprints compare codes case-insensitively per store and kind", () => {
  const coupon = { storeSlug: "zalando", offerType: "coupon", code: "RABAT10", title: "Kupon 10%" };
  assert.equal(offerDraftFingerprint(coupon), offerDraftFingerprint({ ...coupon, code: "rabat10", title: "Inny tytuł" }));
  assert.notEqual(offerDraftFingerprint(coupon), offerDraftFingerprint({ ...coupon, storeSlug: "modivo" }));
  assert.notEqual(offerDraftFingerprint(coupon), offerDraftFingerprint({ ...coupon, offerType: "campaign" }));
  assert.equal(offerDraftFingerprint({ ...coupon, offerType: "promotion", code: null, title: "Okazje LETNIE" }),
    offerDraftFingerprint({ ...coupon, offerType: "promotion", code: null, title: "okazje letnie" }));
});

test("server validation requires correct merchant and no fabricated publication", () => {
  const drafts = parseOfferDraftTable(OFFER_IMPORT_HEADER +
    "\nzalando;Przecena obuwia;Oferta bez kodu;promotion;;;https://www.zalando.pl/kobiety-promocja/");
  assert.ok("rows" in drafts);
  const row = drafts.rows[0];
  const validated = validateExtensionOffer({
    id: null, storeSlug: row.storeSlug, storeName: "Zalando", storeDomains: ["zalando.pl"],
    title: row.title, description: row.description, offerType: row.offerType,
    code: row.code, validUntil: row.validUntil, destinationUrl: row.destinationUrl,
    pagePath: "/kody-rabatowe/zalando", published: false, verified: false,
  });
  assert.ok("value" in validated);
  assert.equal(validated.value.published, false);
  assert.equal(merchantDestination(row.destinationUrl, ["zalando.pl"]), "https://www.zalando.pl/kobiety-promocja/");
  assert.equal(merchantDestination("https://zalando.pl.evil.example/discount", ["zalando.pl"]), null);
  assert.ok("error" in validateExtensionOffer({ ...validated.value, verified: false, published: true }));
});

test("owner API rechecks all rows, blocks duplicates, and never publishes", () => {
  const api = read("../app/api/admin/extension-offers/import/route.ts");
  const ui = read("../components/admin/AdminBulkOfferImporter.tsx");
  const page = read("../app/admin/kody-rabatowe/page.tsx");
  const editor = read("../components/admin/AdminCouponStudio.tsx");
  assert.match(api, /auth\.getClaims\(\)/);
  assert.match(api, /admin\?\.role !== "owner"/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /MAX_IMPORT_ROWS/);
  assert.match(api, /validateExtensionOffer\(/);
  assert.match(api, /merchantDestination\(/);
  assert.match(api, /offerDraftFingerprint/);
  assert.match(api, /insert\(payloads\)/);
  assert.match(api, /published: false/);
  assert.match(api, /last_verified_at: null/);
  assert.match(api, /row.offerType === "promotion"/);
  assert.match(ui, /row.offerType === "promotion"/);
  assert.doesNotMatch(api, /service_role|serviceRoleKey/);
  assert.match(ui, /parseOfferDraftTable\(table\)/);
  assert.match(ui, /Zapisz .*ofert jako szkice/);
  assert.match(page, /AdminBulkOfferImporter/);
  assert.match(editor, /Duplikuj jako szkic/);
  assert.match(editor, /Kopia: /);
  assert.match(editor, /code: row.code/);
  assert.match(editor, /verified: false/);
  assert.match(editor, /Wygasłe/);
  assert.doesNotMatch(ui + page, /cashback|wtyczk|chrome/i);
});

test("new import tests are part of production build", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.match(pkg.scripts["test:offer-import"], /tests\/offer-import\.test\.mjs/);
  assert.match(pkg.scripts.build, /npm run test:offer-import && next build/);
});
