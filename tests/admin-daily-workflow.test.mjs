import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const adminPage = read("../app/admin/page.tsx");
const dashboard = read("../components/admin/AdminMobileDashboard.tsx");
const catalog = read("../components/admin/AdminProductList.tsx");
const actions = read("../components/admin/AdminProductActions.tsx");
const shell = read("../components/admin/AdminAppShell.tsx");

test("dashboard exposes review actions only for data that needs review", () => {
  assert.ok(dashboard.includes('aria-labelledby="admin-review-heading"'));
  assert.ok(dashboard.includes("hiddenProducts > 0"));
  assert.ok(dashboard.includes("duplicateConflicts > 0"));
  assert.ok(dashboard.includes('href="/admin?view=hidden#admin-offers"'));
  assert.ok(dashboard.includes('href="#admin-duplicate-review"'));
  assert.ok(adminPage.includes('id="admin-duplicate-review"'));
  assert.ok(dashboard.includes("Brak ukrytych ofert i oznaczonych konfliktów."));
});

test("dashboard offers manual refresh without bypassing Next.js session handling", () => {
  assert.ok(dashboard.includes('import { useRouter } from "next/navigation"'));
  assert.ok(dashboard.includes("useTransition()"));
  assert.ok(dashboard.includes("startRefreshing(() => router.refresh())"));
  assert.ok(dashboard.includes('aria-label="Odśwież dane panelu"'));
  assert.ok(dashboard.includes("disabled={isRefreshing}"));
});

test("recent products have clear thumb-sized edit and social actions", () => {
  assert.ok(dashboard.includes("product.canManage &&"));
  assert.ok(dashboard.includes('href={`/admin/edytuj/${product.id}`}'));
  assert.ok(dashboard.includes('href={`/admin/social/${product.id}`}'));
  assert.ok(dashboard.includes("inline-flex min-h-11"));
  assert.ok(dashboard.includes("flex-wrap items-center gap-2 pt-2"));
});

test("filtered catalogue links sanitize views before passing them to the client", () => {
  assert.ok(adminPage.includes('view?: string;'));
  for (const name of ['"hidden"', '"featured"', '"active"']) {
    assert.ok(adminPage.includes("params.view === " + name));
  }
  assert.ok(adminPage.includes('? params.view : "all"'));
  assert.ok(adminPage.includes("key={requestedView}"));
  assert.ok(adminPage.includes("initialStatus={requestedView}"));
  assert.ok(catalog.includes('initialStatus?: StatusFilter;'));
  assert.ok(catalog.includes('initialStatus = "all"'));
  assert.ok(catalog.includes("useState<StatusFilter>("));
  assert.ok(catalog.includes("initialStatus"));
});

test("search includes product URL slugs and supports rapid clearing", () => {
  assert.ok(catalog.includes("product.slug,"));
  assert.ok(catalog.includes('id="admin-product-search"'));
  assert.ok(catalog.includes('htmlFor="admin-product-search"'));
  assert.ok(catalog.includes('enterKeyHint="search"'));
  assert.ok(catalog.includes('maxLength={120}'));
  assert.ok(catalog.includes('aria-label="Wyczyść wyszukiwanie produktów"'));
  assert.ok(catalog.includes('onClick={() => setQuery("")}'));
  assert.ok(catalog.includes("pr-12 text-base"));
});

test("filters are thumb-sized and accessible with live result counts", () => {
  assert.ok(catalog.includes('aria-controls="admin-product-advanced-filters"'));
  assert.ok(catalog.includes('id="admin-product-advanced-filters"'));
  assert.ok(catalog.includes("aria-pressed={active}"));
  assert.ok(catalog.includes("inline-flex min-h-11"));
  assert.ok(catalog.includes('role="status" aria-live="polite"'));
  assert.ok(catalog.includes("filteredProducts.length > visibleProducts.length"));
});

test("existing permission checks and optimistic actions remain intact", () => {
  assert.ok(catalog.includes("canManageOffer({"));
  assert.ok(catalog.includes("AdminProductActions"));
  assert.ok(catalog.includes("AdminProductOwnerSelect"));
  assert.ok(catalog.includes("onActiveChange"));
  assert.ok(catalog.includes("onDeleteOptimistic"));
  assert.ok(catalog.includes("onDeleteRollback"));
  assert.ok(actions.includes("window.confirm("));
  assert.ok(actions.includes("canManage"));
});

test("daily workflow does not disturb mobile shell or desktop navigation", () => {
  assert.ok(shell.includes('href="/admin/stylizacje"'));
  assert.ok(shell.includes('href="/admin#admin-offers"'));
  assert.ok(dashboard.includes('className="admin-mobile-dashboard lg:hidden"'));
  assert.ok(adminPage.includes('className="hidden lg:block"'));
  assert.ok(dashboard.includes("currentRole ==="));
});

test("modified JSX class attributes remain closed", () => {
  for (const source of [adminPage, dashboard, catalog]) {
    assert.equal(source.match(/className="[^"\n>]*>/g), null);
  }
});
