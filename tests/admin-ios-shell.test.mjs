import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const shell = read("../components/admin/AdminAppShell.tsx");
const header = read("../components/admin/AdminHeader.tsx");
const styles = read("../app/globals.css");
const adminLayout = read("../app/admin/layout.tsx");
const adminPage = read("../app/admin/page.tsx");

const tabs = shell.slice(shell.indexOf("function MobileBottomNavigation({"), shell.indexOf("function MoreSheet({"));
const newStyles = styles.slice(styles.indexOf("ADMIN iOS MOBILE SHELL"), styles.indexOf("RESPONSIVE PUBLIC SITE"));

test("five iOS tabs directly reach dashboard, offers, outfits, social and more", () => {
  assert.equal((tabs.match(/<BottomNavLink\s/g) ?? []).length, 4);
  assert.match(tabs, /href="\/admin"/);
  assert.match(tabs, /href="\/admin#admin-offers"/);
  assert.match(tabs, /href="\/admin\/stylizacje"/);
  assert.match(tabs, /href="\/admin\/social"/);
  assert.match(tabs, /<BottomIcon type="more"/);
  assert.match(tabs, /aria-label="Nawigacja aplikacji administratora"/);
  assert.match(tabs, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(tabs, /aria-expanded=\{moreOpen\}/);
});

test("offers anchor gets its own active tab, other pages use contextual navigation", () => {
  assert.match(shell, /window\.location\.hash/);
  assert.match(shell, /addEventListener\("hashchange", syncHash\)/);
  assert.match(shell, /addEventListener\("popstate", syncHash\)/);
  assert.match(tabs, /offersActive = onDashboard && activeHash === "#admin-offers"/);
  assert.match(tabs, /pathname\.startsWith\("\/admin\/stylizacje"\)/);
  assert.match(tabs, /pathname\.startsWith\("\/admin\/statystyki"\)/);
  assert.match(adminPage, /id="admin-offers"/);
});

test("essential tools remain accessible when secondary routes move to More", () => {
  for (const destination of [
    "/admin/nowa-oferta", "/admin/statystyki", "/admin/tiktok",
    "/admin/seo", "/admin/zespol", "/admin/stylizacje", "/admin#admin-offers",
  ]) assert.ok(shell.includes(`href="${destination}"`), destination);
  assert.match(shell, /Zainstaluj Trend Admin/);
  assert.match(shell, /action="\/auth\/signout"/);
});

test("mobile header has correct titles, a quick create action and account access", () => {
  assert.match(header, /getMobileTitle\(pathname\)/);
  assert.match(header, /pathname\.startsWith\("\/admin\/stylizacje"\)/);
  assert.match(header, /pathname\.startsWith\("\/admin\/widocznosc"\)/);
  assert.match(header, /href="\/admin\/nowa-oferta"/);
  assert.match(header, /aria-label="Dodaj nową ofertę"/);
  assert.match(header, /aria-label="Konto administratora"/);
  assert.match(header, /showQuickAdd/);
  assert.match(newStyles, /\.admin-mobile-topbar\s*\{\s*display: flex/);
  assert.match(header, /className="mx-auto hidden min-h-\[62px\].*lg:flex/);
});

test("immersive offer and social editing still suppress the bottom navigation", () => {
  assert.match(shell, /pathname ===\s*"\/admin\/nowa-oferta"/);
  assert.match(shell, /pathname\.startsWith\(\s*"\/admin\/edytuj\/"/);
  assert.match(shell, /\^\\\/admin\\\/social\\\/\[\^\/\]\+\$\/\.test/);
  assert.match(shell, /!immersiveRoute && \(/);
  assert.match(shell, /!immersiveRoute &&\s*moreOpen && \(/);
});

test("bottom bar is accounted for exactly once and respects iPhone safe areas", () => {
  assert.match(shell, /pb-\[calc\(96px\+env\(safe-area-inset-bottom\)\)\]/);
  assert.doesNotMatch(shell, /has-mobile-bottom-nav/);
  assert.doesNotMatch(styles, /body\.has-mobile-bottom-nav/);
  assert.match(newStyles, /safe-area-inset-bottom/);
  assert.match(newStyles, /safe-area-inset-left/);
  assert.match(newStyles, /safe-area-inset-right/);
  assert.match(styles, /safe-area-inset-top/);
});

test("More and account sheets are keyboard-operable accessible dialogs", () => {
  for (const source of [shell, header]) {
    assert.match(source, /role="dialog"/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /tabIndex=\{-1\}/);
    assert.match(source, /dialog\?\.focus\(\)/);
    assert.match(source, /event\.key === "Escape"/);
    assert.match(source, /event\.shiftKey/);
    assert.match(source, /previousFocus\?\.focus\(\)/);
    assert.match(source, /dialog\.contains\(document\.activeElement\)/);
  }
  assert.match(shell, /aria-labelledby="admin-more-title"/);
  assert.match(shell, /aria-controls="admin-more-sheet"/);
  assert.match(header, /aria-controls="admin-account-sheet"/);
});

test("iOS appearance remains mobile-scoped and avoids tiny touch targets", () => {
  assert.match(newStyles, /@media \(max-width: 1023px\)/);
  assert.match(newStyles, /\.admin-mobile-back,[\s\S]*width: 44px/);
  assert.match(newStyles, /\.admin-mobile-create/);
  assert.match(newStyles, /\.admin-ios-tabbar/);
  assert.match(newStyles, /backdrop-filter: saturate/);
  assert.match(newStyles, /min-height: 60px/);
  assert.match(newStyles, /font-size: 16px/);
  assert.match(newStyles, /focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(adminLayout, /<AdminAppShell>/);
  assert.match(adminLayout, /index:\s*false/);
});

test("JSX class attributes and navigation closing tags remain well-formed", () => {
  for (const source of [shell, header]) {
    assert.doesNotMatch(source, /className="[^"\n>]*>/);
  }
  assert.equal(tabs.split("<BottomNavLink").length - 1, 4);
});
