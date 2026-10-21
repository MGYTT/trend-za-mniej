import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const DEFAULT_TARGETS = ["app", "components", "lib", "proxy.ts", "next.config.ts"];
const SOURCE_FILE = /\.(?:ts|tsx)$/;

export async function checkSyntax(root = process.cwd(), targets = DEFAULT_TARGETS) {
  const errors = [];
  let checked = 0;

  async function visit(path) {
    let entries;
    try {
      entries = await readdir(path, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOTDIR") {
        if (!SOURCE_FILE.test(path)) return;
        const code = await readFile(path, "utf8");
        const source = ts.createSourceFile(
          path, code, ts.ScriptTarget.Latest, true,
          path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
        );
        checked += 1;
        for (const issue of source.parseDiagnostics) {
          const loc = source.getLineAndCharacterOfPosition(issue.start ?? 0);
          errors.push({
            file: relative(root, path),
            line: loc.line + 1,
            column: loc.character + 1,
            message: ts.flattenDiagnosticMessageText(issue.messageText, " "),
          });
        }
        return;
      }
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (["node_modules", ".next", ".git", "dist", "build"].includes(entry.name)) continue;
        await visit(join(path, entry.name));
      } else if (entry.isFile() && SOURCE_FILE.test(entry.name)) {
        await visit(join(path, entry.name));
      }
    }
  }

  for (const item of targets) await visit(resolve(root, item));
  return { checked, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkSyntax();
  for (const issue of result.errors) {
    console.error(`${issue.file}:${issue.line}:${issue.column}: ${issue.message}`);
  }
  if (result.errors.length) {
    console.error(`Kontrola składni: ${result.errors.length} błędów w ${result.checked} plikach.`);
    process.exitCode = 1;
  } else {
    console.log(`Kontrola składni: ${result.checked} plików TS/TSX bez błędów parsowania.`);
  }
}
