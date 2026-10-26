import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  polishToday, validOfferDay, daysUntil, lifecycleStatus, renewalError,
} from "../lib/offer-lifecycle.ts";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const today = "2026-10-26";

test("Poland calendar day is correct around CET and CEST transitions", () => {
  assert.equal(polishToday(new Date("2026-10-26T00:30:00Z")), "2026-10-26");
  assert.equal(polishToday(new Date("2026-07-01T22:30:00Z")), "2026-07-02");
  assert.equal(polishToday(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  assert.equal(validOfferDay("2026-02-30"), false);
  assert.equal(validOfferDay("2028-02-29"), true);
});

test("last day inclusive and three-day warning", () => {
  assert.equal(daysUntil("2026-10-29", today), 3);
  assert.equal(lifecycleStatus({published:true, validUntil:"2026-10-26"}, today), "expiring");
  assert.equal(lifecycleStatus({published:true, validUntil:"2026-10-29"}, today), "expiring");
  assert.equal(lifecycleStatus({published:true, validUntil:"2026-10-30"}, today), "active");
  assert.equal(lifecycleStatus({published:true, validUntil:null}, today), "active");
  assert.equal(lifecycleStatus({published:true, validUntil:"2026-10-25"}, today), "expired");
  assert.equal(lifecycleStatus({published:false, validUntil:"2026-10-25"}, today), "expired");
  assert.equal(lifecycleStatus({published:false, validUntil:"2026-11-02"}, today), "draft");
});

test("renewal requires genuinely later, future date and soon-expiring record", () => {
  const expiring = { published: true, validUntil: "2026-10-29" };
  const expired = { published: false, validUntil: "2026-10-20" };
  assert.equal(renewalError(expiring, "2026-11-02", today), null);
  assert.equal(renewalError(expired, "2026-11-02", today), null);
  assert.match(renewalError(expiring, "2026-10-29", today), /późniejsza/);
  assert.match(renewalError(expiring, "2026-10-26", today), /po dzisiejszym/);
  assert.match(renewalError(expiring, "2026-11-31", today), /po dzisiejszym/);
  assert.match(renewalError({published:true, validUntil:null}, "2026-11-01", today), /nie ma daty/);
  assert.match(renewalError({published:true, validUntil:"2026-12-01"}, "2027-01-01", today), /wygasającą/);
});

test("owner-only API prevents blind republishing and concurrent edits", () => {
  const api = read("../app/api/admin/offer-lifecycle/route.ts");
  assert.match(api, /auth\.getClaims\(\)/);
  assert.match(api, /admin\?\.role !== "owner"/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /body\.confirmed !== true/);
  assert.match(api, /eq\("updated_at", input\.expectedUpdatedAt\)/);
  assert.match(api, /published: record\.published/);
  assert.match(api, /last_reviewed_at/);
  assert.match(api, /last_verified_at/);
  assert.doesNotMatch(api, /service_role|serviceRoleKey/);
});

test("unified manager covers both sources and is linked from existing admin", () => {
  const page = read("../app/admin/terminy-promocji/page.tsx");
  const ui = read("../components/admin/OfferLifecycleStudio.tsx");
  assert.match(page, /shein_campaigns/);
  assert.match(page, /extension_offers/);
  assert.match(ui, /Wygasają wkrótce/);
  assert.match(ui, /Szkice/);
  assert.match(ui, /Przedłuż po weryfikacji/);
  assert.match(read("../components/admin/AdminDesktopSidebar.tsx"), /\/admin\/terminy-promocji/);
  assert.match(read("../app/admin/kody-rabatowe/page.tsx"), /\/admin\/terminy-promocji/);
  assert.match(read("../app/admin/promocje-shein/page.tsx"), /\/admin\/terminy-promocji/);
  assert.doesNotMatch(page + ui, /cashback|wtyczk|rozszerzen|chrome/i);
});
