import path from "node:path";
import { performance } from "node:perf_hooks";

import type {
  LoadEnvOptions,
  LoadEnvResult,
  LogLevel,
  FileStatus,
} from "./types";
import { createLogger } from "./logger";
import { resolveEnvFiles, resolveEnvName } from "./resolver";
import { readTextFileSafe } from "./reader";
import { parseEnv } from "./parser";
import { mergeRecords, applyMergedToProcessEnv } from "./merge";

function defaultLogLevel(env: string): LogLevel {
  const isProd = env === "production" || process.env.NODE_ENV === "production";
  return isProd ? "silent" : "info";
}

export function loadEnv(options: LoadEnvOptions = {}): LoadEnvResult {
  const t0 = performance.now();

  const env = resolveEnvName(options.env, process.argv);
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const isProd = env === "production" || process.env.NODE_ENV === "production";

  const logLevel = options.logLevel ?? defaultLogLevel(env);
  const logger = createLogger(logLevel);

  const applyToProcessEnv = options.applyToProcessEnv ?? true;
  const overrideProcessEnv = options.overrideProcessEnv ?? false;
  const allowLocalInProduction = options.allowLocalInProduction ?? false;
  const warnOnMissing = options.warnOnMissing ?? false;
  const strict = options.strict ?? false;

  const required = options.required ?? [];
  const throwOnError = options.throwOnError ?? true;

  logger.info(`env=${env} cwd=${cwd}`);

  const filePaths = resolveEnvFiles({ cwd, env, allowLocalInProduction });
  const files: FileStatus[] = [];
  const parsedList: Record<string, string>[] = [];

  for (const fp of filePaths) {
    const base = path.basename(fp);
    if (isProd && !allowLocalInProduction && base.endsWith(".local")) {
      files.push({ path: fp, found: false, loaded: false });
      logger.verbose(`file ✗ ${base} (skipped in production)`);
      continue;
    }

    const read = readTextFileSafe(fp);
    if (!read.ok) {
      files.push({ path: fp, found: false, loaded: false });
      if (warnOnMissing)
        logger.verbose(`file ✗ ${path.basename(fp)} (not found)`);
      continue;
    }

    files.push({ path: fp, found: true, loaded: true });
    logger.verbose(`file ✓ ${path.basename(fp)}`);

    try {
      const parsed = parseEnv(read.text, { strict, filePath: fp });
      parsedList.push(parsed);
    } catch (e: any) {
      logger.error(String(e?.message ?? e));
      throw e;
    }
  }

  const merged = mergeRecords(parsedList);

  let applied: Record<string, string> = {};
  let skipped: LoadEnvResult["skipped"] = [];
  if (applyToProcessEnv) {
    const r = applyMergedToProcessEnv({ merged, overrideProcessEnv });
    applied = r.applied;
    skipped = r.skipped;
  }

  const errors: string[] = [];

  if (required.length) {
    for (const key of required) {
      const value =
        (applyToProcessEnv ? process.env[key] : undefined) ?? merged[key];
      if (value === undefined || value === "") {
        errors.push(`Missing required env key: ${key}`);
      }
    }
  }

  if (errors.length) {
    for (const err of errors) logger.error(err);
    if (throwOnError) {
      throw new Error("envlayer validation failed");
    }
  }

  const t1 = performance.now();
  const durationMs = Math.max(0, t1 - t0);

  const loadedNames = files
    .filter((f) => f.loaded)
    .map((f) => path.basename(f.path));
  if (loadedNames.length) {
    logger.info(
      `loaded: ${loadedNames.join(", ")} (keys=${Object.keys(merged).length}, applied=${Object.keys(applied).length}, skipped=${skipped.length}, ${durationMs.toFixed(1)}ms)`,
    );
  } else {
    logger.info(`loaded: none (${durationMs.toFixed(1)}ms)`);
  }

  return {
    ok: errors.length === 0,
    errors,
    env,
    cwd,
    files,
    parsed: merged,
    applied,
    skipped,
    durationMs,
  };
}
