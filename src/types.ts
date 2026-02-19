export type LogLevel = "silent" | "info" | "verbose" | "debug";

export type LoadEnvOptions = {
  env?: string;
  cwd?: string;

  applyToProcessEnv?: boolean; // default true
  overrideProcessEnv?: boolean; // default false

  allowLocalInProduction?: boolean; // default false
  warnOnMissing?: boolean; // default false
  requiredFiles?: string[]; // default []

  required?: string[];
  throwOnError?: boolean; // default true

  logLevel?: LogLevel; // default: production->silent, else info
  strict?: boolean; // default false
};

export type FileStatus = {
  path: string;
  found: boolean;
  loaded: boolean;
};

export type SkippedKey = {
  key: string;
  reason: "already_in_process_env" | "override_disabled";
};

export type LoadEnvResult = {
  ok: boolean;
  errors: string[];

  env: string;
  cwd: string;
  files: FileStatus[];
  parsed: Record<string, string>;
  applied: Record<string, string>;
  skipped: SkippedKey[];
  durationMs: number;
};
