import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/index";

test("required keys validation throws when missing", () => {
  // Ensure key doesn't exist
  delete process.env.ENVLAYER_REQUIRED_TEST;

  assert.throws(() => {
    loadEnv({
      applyToProcessEnv: false,
      required: ["ENVLAYER_REQUIRED_TEST"],
      throwOnError: true,
      logLevel: "silent",
    });
  });
});
