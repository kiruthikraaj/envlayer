import fs from "node:fs";

export function readTextFileSafe(filePath: string):
  | { ok: true; text: string }
  | { ok: false; reason: "not_found" | "error"; error?: unknown } {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    return { ok: true, text };
  } catch (e: any) {
    if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) {
      return { ok: false, reason: "not_found" };
    }
    return { ok: false, reason: "error", error: e };
  }
}