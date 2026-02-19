import type { SkippedKey } from "./types";

export function mergeRecords(records: Record<string, string>[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const r of records) {
    for (const [k, v] of Object.entries(r)) merged[k] = v;
  }
  return merged;
}

export function applyMergedToProcessEnv(params: {
  merged: Record<string, string>;
  overrideProcessEnv: boolean;
}): { applied: Record<string, string>; skipped: SkippedKey[] } {
  const applied: Record<string, string> = {};
  const skipped: SkippedKey[] = [];

  for (const [key, value] of Object.entries(params.merged)) {
    const exists = typeof process.env[key] === "string";
    if (exists && !params.overrideProcessEnv) {
      skipped.push({ key, reason: "already_in_process_env" });
      continue;
    }
    process.env[key] = value;
    applied[key] = value;
  }

  return { applied, skipped };
}