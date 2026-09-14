import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("page generator creates an authorized shared-component page without overwriting", () => {
  const root = mkdtempSync(join(tmpdir(), "vox-generator-"));
  try {
    mkdirSync(join(root, "scripts"));
    mkdirSync(join(root, "src/lib"), { recursive: true });
    copyFileSync(
      "scripts/create-admin-page.mjs",
      join(root, "scripts/create-admin-page.mjs"),
    );
    copyFileSync(
      "src/lib/admin-modules.ts",
      join(root, "src/lib/admin-modules.ts"),
    );
    const generate = (...args: string[]) =>
      spawnSync(
        process.execPath,
        [join(root, "scripts/create-admin-page.mjs"), ...args],
        { encoding: "utf8" },
      );
    assert.equal(generate("schedules", "Schedules").status, 0);
    const content = readFileSync(
      join(root, "src/app/admin/(console)/schedules/page.tsx"),
      "utf8",
    );
    assert.match(content, /await requireSuperuser\(\)/);
    assert.match(content, /<Page/);
    assert.doesNotMatch(content, /className=|style=/);
    assert.match(
      readFileSync(join(root, "src/lib/admin-modules.ts"), "utf8"),
      /"slug":"schedules"/,
    );
    assert.equal(generate("schedules", "Overwrite").status, 1);
    assert.equal(generate("../../unsafe", "Unsafe").status, 1);
    assert.equal(generate("login", "Reserved").status, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
