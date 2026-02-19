import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

test("cli runner loads layered env and runs command", () => {
  const cli = path.resolve("dist/cli.cjs");
  const cwd = path.resolve("bench/fixtures");

  const res = spawnSync(
    process.execPath,
    [
      cli,
      "--env=uat",
      `--cwd=${cwd}`,
      "--",
      process.execPath,
      "-e",
      "console.log(process.env.B)",
    ],
    { encoding: "utf8" },
  );

  assert.equal(res.status, 0, res.stderr || "non-zero exit");
  assert.match(res.stdout, /uat/);
});
