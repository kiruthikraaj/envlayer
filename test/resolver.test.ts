import test from "node:test";
import assert from "node:assert/strict";
import { resolveEnvFiles } from "../src/resolver";

test("resolveEnvFiles returns layered list", () => {
  const files = resolveEnvFiles({ cwd: "/app", env: "uat", allowLocalInProduction: false });
  assert.deepEqual(files, [
    "/app/.env.defaults",
    "/app/.env",
    "/app/.env.uat",
    "/app/.env.local",
    "/app/.env.uat.local",
  ]);
});