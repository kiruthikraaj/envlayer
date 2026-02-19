import path from "node:path";

function readArgValue(argv: string[], name: string, short?: string): string | undefined {
  // --env=uat
  const longEq = argv.find((a) => a.startsWith(`${name}=`));
  if (longEq) return longEq.slice(name.length + 1);

  // --env uat
  const longIdx = argv.indexOf(name);
  if (longIdx !== -1 && argv[longIdx + 1] && argv[longIdx + 1] !== "--") return argv[longIdx + 1];

  if (short) {
    const shortIdx = argv.indexOf(short);
    if (shortIdx !== -1 && argv[shortIdx + 1] && argv[shortIdx + 1] !== "--") return argv[shortIdx + 1];
  }
  return undefined;
}

export function resolveEnvName(optionsEnv?: string, argv = process.argv): string {
  if (optionsEnv && optionsEnv.trim()) return optionsEnv.trim();

  const cli = readArgValue(argv, "--env", "-e") ?? readArgValue(argv, "--environment");
  if (cli && cli.trim()) return cli.trim();

  const ENV = process.env.ENV?.trim();
  if (ENV) return ENV;

  const NODE_ENV = process.env.NODE_ENV?.trim();
  if (NODE_ENV) return NODE_ENV;

  return "development";
}

export function resolveEnvFiles(params: {
  cwd: string;
  env: string;
  allowLocalInProduction: boolean;
}): string[] {
  const { cwd, env } = params;
  const isProd = env === "production" || process.env.NODE_ENV === "production";
  const allowLocal = params.allowLocalInProduction || !isProd;

  const files: string[] = [];
  files.push(path.join(cwd, ".env.defaults"));
  files.push(path.join(cwd, ".env"));
  files.push(path.join(cwd, `.env.${env}`));

  if (allowLocal) {
    files.push(path.join(cwd, ".env.local"));
    files.push(path.join(cwd, `.env.${env}.local`));
  } else {
    // still include in candidate list? better not; resolver defines what’s considered
  }

  return files;
}