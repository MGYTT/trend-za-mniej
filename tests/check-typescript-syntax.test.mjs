import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSyntax } from "../scripts/check-typescript-syntax.mjs";

async function withProject(files, callback) {
  const dir = await mkdtemp(join(tmpdir(), "trend-syntax-"));
  try {
    await mkdir(join(dir, "app"));
    for (const [name, content] of files) {
      await writeFile(join(dir, "app", name), content, "utf8");
    }
    return await callback(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("poprawne JSX oraz TypeScript przechodzą kontrolę", async () => {
  await withProject([
    ["good.tsx", 'export const Good = () => <svg>{true && (<path d="M1 1" />)}</svg>;'],
    ["good.ts", 'export const value: number = 12;'],
  ], async (dir) => {
    const result = await checkSyntax(dir, ["app"]);
    assert.equal(result.checked, 2);
    assert.deepEqual(result.errors, []);
  });
});

test("brak nawiasu JSX w menu mobilnym jest wykrywany", async () => {
  const broken = `export function Nav({ type }: { type: string }) {
    return <svg>
      {type === "outfits" && (<path d="M1 1" />)
      {type === "promotions" && (<circle />)}
    </svg>;
  }`;
  await withProject([["MobileBottomNav.tsx", broken]], async (dir) => {
    const result = await checkSyntax(dir, ["app"]);
    assert.equal(result.checked, 1);
    assert.ok(result.errors.length > 0);
    assert.equal(result.errors[0].file, "app/MobileBottomNav.tsx");
  });
});

test("pomija brakujące opcjonalne pliki i katalogi", async () => {
  await withProject([], async (dir) => {
    const result = await checkSyntax(dir, ["app", "components", "proxy.ts"]);
    assert.equal(result.checked, 0);
    assert.deepEqual(result.errors, []);
  });
});
