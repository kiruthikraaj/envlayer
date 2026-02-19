import test from "node:test";
import assert from "node:assert/strict";
import { parseEnv } from "../src/parser";

test("parseEnv parses basic KEY=value", () => {
  const out = parseEnv("A=1\nB=hello\n", { strict: true, filePath: ".env" });
  assert.equal(out.A, "1");
  assert.equal(out.B, "hello");
});

test("parseEnv supports export + quotes", () => {
  const out = parseEnv(`export A="hi there"\nB='ok'\n`, { strict: true, filePath: ".env" });
  assert.equal(out.A, "hi there");
  assert.equal(out.B, "ok");
});