import test from "node:test";
import assert from "node:assert/strict";
import { mergeRecords } from "../src/merge";

test("mergeRecords later wins", () => {
  const merged = mergeRecords([{ A: "1", B: "x" }, { B: "y" }]);
  assert.equal(merged.A, "1");
  assert.equal(merged.B, "y");
});