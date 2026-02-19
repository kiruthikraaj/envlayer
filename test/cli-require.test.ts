import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

test("cli --require fails cleanly when missing", () => {
  const cli = path.resolve("dist/cli.cjs");
  const cwd = path.resolve("bench/fixtures");

  const res = spawnSync(
    process.execPath,
    [
      cli,
      "--env=uat",
      `--cwd=${cwd}`,
      "--require",
      "MISSING_KEY",
      "--",
      process.execPath,
      "-e",
      "console.log('ok')",
    ],
    { encoding: "utf8" },
  );

  assert.notEqual(res.status, 0);
  assert.match(
    res.stdout + res.stderr,
    /Missing required env key: MISSING_KEY/,
  );
  assert.doesNotMatch(res.stderr ?? "", /at loadEnv/);
});
