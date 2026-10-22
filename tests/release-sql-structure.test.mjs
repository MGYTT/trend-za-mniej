import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const migration = read("../docs/sql/affiliate-click-attribution.sql");
const queue = read("../docs/sql/security-queue-lockdown.sql");

function statementsAreSingleTransaction(sql) {
  const withoutComments = sql.replace(/--[^\n]*/g, "");
  const starts = (withoutComments.match(/\bBEGIN\s*;/g) ?? []).length;
  const commits = (withoutComments.match(/\bCOMMIT\s*;/g) ?? []).length;
  assert.equal(starts, 1);
  assert.equal(commits, 1);
  assert.match(withoutComments, /^\s*BEGIN\s*;/);
  assert.match(withoutComments, /COMMIT\s*;\s*$/);
}

test("migration SQL has a single transaction and no duplicate CREATE FUNCTION", () => {
  statementsAreSingleTransaction(migration);
  assert.equal((migration.match(/CREATE OR REPLACE FUNCTION/g) ?? []).length, 1);
  assert.equal((migration.match(/CREATE INDEX IF NOT EXISTS/g) ?? []).length, 1);
});
test("all dollar-quoted SQL blocks have balanced delimiters", () => {
  for (const tag of ["verify_privacy", "check_source", "check_consistency", "source_stats"]) {
    const count = migration.split("$" + tag + "$").length - 1;
    assert.equal(count, 2, tag + " delimiter must appear exactly twice");
  }
});
test("stats function observes RLS and blocks anonymous execution", () => {
  assert.match(migration, /SECURITY INVOKER/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION public\.get_affiliate_source_stats\(integer\)/);
  assert.match(migration, /FROM PUBLIC, anon;/);
  assert.match(migration, /TO authenticated, service_role;/);
  assert.match(migration, /WHERE c\.created_at >= current_date/);
});
test("source constraints validate type, slug and relationship", () => {
  assert.match(migration, /source_type IN \('outfit', 'product', 'unknown'\)/);
  assert.match(migration, /outfit_slug IS NOT NULL/);
  assert.match(migration, /length\(outfit_slug\) <= 100/);
});
test("queue lockdown only restricts direct RPC and leaves service role", () => {
  statementsAreSingleTransaction(queue);
  assert.match(queue, /REVOKE EXECUTE ON FUNCTION public\.queue_search_index_path\(text, text\)/);
  assert.match(queue, /FROM PUBLIC, anon, authenticated;/);
  assert.match(queue, /TO service_role;/);
  assert.doesNotMatch(queue, /DROP\s+(FUNCTION|TABLE)/);
});

test("migration limits locks and fails before altering a table with weaker privacy", () => {
  assert.match(migration, /SET LOCAL lock_timeout = '5s'/);
  assert.match(migration, /SET LOCAL statement_timeout = '60s'/);
  assert.match(migration, /has_table_privilege\('anon', 'public\.affiliate_clicks', 'SELECT'\)/);
  assert.match(migration, /has_table_privilege\('anon', 'public\.affiliate_clicks', 'INSERT'\)/);
  const safetyGate = migration.indexOf("DO $verify_privacy$");
  const change = migration.indexOf("ALTER TABLE public.affiliate_clicks");
  assert.ok(safetyGate !== -1 && change > safetyGate);
  assert.doesNotMatch(migration, /\bDROP\s+(TABLE|COLUMN)|\bTRUNCATE\b/i);
});
