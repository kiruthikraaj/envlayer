#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { loadEnv } from "./index";

function parseArgs(argv: string[]) {
  // argv includes: node, cli.js, ...
  const args = argv.slice(2);

  // Split at `--`
  const sep = args.indexOf("--");
  const envlayerArgs = sep === -1 ? args : args.slice(0, sep);
  const cmdArgs = sep === -1 ? [] : args.slice(sep + 1);

  const hasFlag = (long: string, short?: string) =>
    envlayerArgs.includes(long) ||
    (short ? envlayerArgs.includes(short) : false);

  const getFlag = (long: string, short?: string) => {
    // --env=uat
    const eq = envlayerArgs.find((a) => a.startsWith(`${long}=`));
    if (eq) return eq.slice(long.length + 1);

    // --env uat
    const li = envlayerArgs.indexOf(long);
    if (li !== -1 && envlayerArgs[li + 1] && envlayerArgs[li + 1] !== "--") {
      return envlayerArgs[li + 1];
    }

    // -e uat
    if (short) {
      const si = envlayerArgs.indexOf(short);
      if (si !== -1 && envlayerArgs[si + 1] && envlayerArgs[si + 1] !== "--") {
        return envlayerArgs[si + 1];
      }
    }

    return undefined;
  };

  const help = hasFlag("--help", "-h");

  const env = getFlag("--env", "-e") ?? getFlag("--environment");
  const cwd = getFlag("--cwd") ?? getFlag("--dir");

  const quiet = hasFlag("--quiet", "-q");
  const verbose = hasFlag("--verbose", "-v");
  const debug = hasFlag("--debug");

  const override = hasFlag("--override");
  const allowLocalInProduction = hasFlag("--allow-local-in-production");
  const warnMissing = hasFlag("--warn-missing");

  const logLevel = quiet
    ? "silent"
    : debug
      ? "debug"
      : verbose
        ? "verbose"
        : "info";

  return {
    options: {
      env,
      cwd,
      logLevel,
      overrideProcessEnv: override,
      allowLocalInProduction,
      warnOnMissing: warnMissing,
    } as const,
    cmdArgs,
    help,
  };
}

function main() {
  const { options, cmdArgs, help } = parseArgs(process.argv);

  if (help) {
    console.log(`envlayer (runner)
Usage:
  envlayer --env <name> [--cwd <dir>] [--quiet|--verbose|--debug] [--override] [--warn-missing] -- <command...>

Examples:
  envlayer --env=uat --cwd . -- node dist/main.js
  envlayer --env=production --quiet -- node dist/main.js
`);
    process.exit(0);
  }

  const resolvedCwd = options.cwd ? path.resolve(options.cwd) : undefined;

  // Load env first
  loadEnv({
    env: options.env,
    cwd: resolvedCwd,
    logLevel: options.logLevel,
    overrideProcessEnv: options.overrideProcessEnv,
    allowLocalInProduction: options.allowLocalInProduction,
    warnOnMissing: options.warnOnMissing,
  });

  // If no command provided, just exit successfully
  if (!cmdArgs.length) process.exit(0);

  const cmd = cmdArgs[0];
  const args = cmdArgs.slice(1);

  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  // Forward exit code / signal
  if (res.signal) {
    // Best-effort forward signal; if this fails, still exit non-zero
    try {
      process.kill(process.pid, res.signal);
    } catch {}
    process.exit(1);
  }

  process.exit(res.status ?? 1);
}

main();
