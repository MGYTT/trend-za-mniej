import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const shell = read("../components/admin/AdminAppShell.tsx");
const sidebar = read("../components/admin/AdminDesktopSidebar.tsx");
const header = read("../components/admin/AdminHeader.tsx");
const page = read("../app/admin/page.tsx");
const catalog = read("../components/admin/AdminProductList.tsx");
const mobile = read("../components/admin/AdminMobileDashboard.tsx");
const css = read("../app/globals.css");

test("wide screens use a persistent sidebar with reserved content area", () => {
  assert.match(shell, /import AdminDesktopSidebar/);
  assert.match(shell, /<AdminDesktopSidebar \/>/);
  assert.match(shell, /xl:pl-\[252px\]/);
  assert.match(css, /@media \(min-width: 1280px\)/);
  assert.match(css, /\.admin-desktop-sidebar\s*\{\s*position: fixed/);
  assert.match(css, /width: 252px/);
  assert.match(css, /max-width: 1440px/);
  assert.match(css, /\.admin-desktop-sidebar\s*\{\s*display: none/);
});

test("all ten existing admin destinations remain reachable from sidebar", () => {
  for (const href of [
    "/admin", "/admin#admin-offers", "/admin/nowa-oferta",
    "/admin/stylizacje", "/admin/social", "/admin/tiktok",
    "/admin/statystyki", "/admin/seo", "/admin/widocznosc", "/admin/zespol",
  ]) {
    assert.ok(sidebar.includes('href: "' + href + '"'), "missing " + href);
  }
  assert.match(sidebar, /aria-label="Sekcje panelu"/);
  assert.match(sidebar, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(sidebar, /hash === "#admin-offers"/);
  assert.match(sidebar, /usePathname\(\)/);
});

test("header switches to contextual desktop title without modifying mobile bar", () => {
  assert.match(header, /className="admin-mobile-topbar lg:hidden"/);
  assert.match(header, /getMobileTitle\(pathname\)/);
  assert.match(header, /hidden min-w-0 flex-col justify-center xl:flex/);
  assert.match(header, /className="flex items-center gap-1 xl:hidden"/);
  assert.match(header, /lg:flex xl:max-w-none xl:px-8/);
  assert.match(header, /aria-label="Konto administratora"/);
});

test("desktop dashboard prioritizes metrics, tasks and shortcuts over diagnostics", () => {
  const stats = page.indexOf('id="desktop-kpis"');
  const tasks = page.indexOf('id="desktop-tasks"');
  const quality = page.indexOf('id="admin-duplicate-review"');
  assert.ok(stats > 0 && tasks > stats && quality > tasks);
  assert.match(page, /className="hidden lg:block"/);
  assert.match(page, /admin-desktop-workspace-hero/);
  assert.match(page, /<StatCard icon="today"/);
  assert.match(page, /<StatCard icon="hidden"/);
  assert.match(page, /<DuplicateProtectionStatus initialSummary=\{duplicateSummary\}/);
});

test("review tasks use real server counts and correct filtered destinations", () => {
  assert.match(page, /hiddenProducts > 0/);
  assert.match(page, /duplicateSummary\.conflicts > 0/);
  assert.match(page, /href="\/admin\?view=hidden#admin-offers"/);
  assert.match(page, /href="#admin-duplicate-review"/);
  assert.match(page, /hiddenProducts === 0 && duplicateSummary\.conflicts === 0/);
  assert.match(page, /key=\{requestedView\}/);
  assert.match(page, /initialStatus=\{requestedView\}/);
});

test("desktop catalog shortcut focuses search only when the user is not typing", () => {
  assert.match(catalog, /const searchRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(catalog, /event\.key !== "\/"/);
  assert.match(catalog, /window\.innerWidth < 1024/);
  assert.match(catalog, /target\?\.closest\('input, textarea, select, \[contenteditable="true"\]'\)/);
  assert.match(catalog, /searchRef\.current\?\.focus\(\)/);
  assert.match(catalog, /removeEventListener\("keydown", focusCatalog\)/);
  assert.match(catalog, /ref=\{searchRef\}/);
  assert.match(catalog, /<kbd aria-hidden="true"/);
});

test("catalog filtering, rights and product actions stay unchanged", () => {
  assert.match(catalog, /canManageOffer\(\{/);
  assert.match(catalog, /AdminProductActions/);
  assert.match(catalog, /AdminProductOwnerSelect/);
  assert.match(catalog, /onActiveChange/);
  assert.match(catalog, /onDeleteOptimistic/);
  assert.match(catalog, /onDeleteRollback/);
  assert.match(catalog, /lg:grid-cols-\[105px_minmax\(0,1fr\)_210px\]/);
});

test("mobile iOS experience and access controls are preserved", () => {
  assert.match(shell, /<MobileBottomNavigation/);
  assert.match(shell, /!immersiveRoute && \(/);
  assert.match(mobile, /className="admin-mobile-dashboard lg:hidden"/);
  assert.match(page, /<AdminMobileDashboard/);
  assert.match(css, /ADMIN iOS MOBILE SHELL/);
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(header, /admin-mobile-create/);
  assert.match(page, /currentRole === "owner"/);
});

test("changed markup keeps JSX class attributes valid", () => {
  for (const source of [shell, sidebar, header, page, catalog]) {
    assert.doesNotMatch(source, /className="[^"\n>]*>/);
  }
});
