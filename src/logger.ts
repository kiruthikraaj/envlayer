import type { LogLevel } from "./types";

const LEVEL: Record<LogLevel, number> = {
  silent: 0,
  info: 1,
  verbose: 2,
  debug: 3,
};

export function createLogger(level: LogLevel, prefix = "envlayer") {
  const cur = LEVEL[level] ?? 1;
  const p = `[${prefix}]`;

  const out = (min: number, msg: string) => {
    if (cur >= min) console.log(`${p} ${msg}`);
  };

  return {
    info: (msg: string) => out(1, msg),
    verbose: (msg: string) => out(2, msg),
    debug: (msg: string) => out(3, msg),
    error: (msg: string) => {
      if (cur >= 0) console.error(`${p} ERROR: ${msg}`);
    },
  };
}