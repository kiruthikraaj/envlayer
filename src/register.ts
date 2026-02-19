import { loadEnv } from "./index";

try {
  loadEnv();
} catch (e) {
  // Keep this minimal and safe (no values).
  console.error("[envlayer] Failed to initialize environment");
  process.exit(1);
}
