# envlayer

Tiny convention-driven layered .env loader for Node.js & TypeScript.

envlayer automatically selects and layers environment files based on --env or NODE_ENV, without overwriting real runtime environment variables by default.

## Why envlayer?

Most .env loaders require manual path configuration.

envlayer:

- Automatically resolves layered .env files
- Safe by default (no process.env override unless enabled)
- Never logs secret values
- Tiny footprint
- Works with both ESM and CJS
- Supports preload hook (-r envlayer/register)

## Benchmarks

Local benchmark (Node.js v22, 2000 iterations, 5 layered files: `.env.defaults`, `.env`, `.env.uat`, `.env.local`, `.env.uat.local`)

| Loader | Avg time (ms/op) | Notes |
| --- | ---: | --- |
| envlayer | **0.0596** | convention-based layered loading |
| dotenv-flow | 0.0688 | layered loading support |
| dotenv (manual layering) | 0.1193 | multiple `dotenv.config()` calls |

> Benchmarks measure repeated load+parse+apply cycles. Real apps typically run env loading once at startup, but relative performance still reflects parser + merge overhead.

## Installation

```bash
npm install envlayer
```

## CLI Runner

Run any command after loading the right `.env*` layers.

```bash
npx envlayer --env=uat --cwd . -- node dist/main.js
```

### Flags

- -e, --env <name>: environment name (e.g. development, uat, production)
- --cwd, --dir <path>: directory to look for .env* files (default: current working directory)
- -r, --require <KEY>: require env key (repeatable)
- -q, --quiet: silence logs
- -v, --verbose: verbose logs
- --debug: debug logs
- --override: overwrite existing process.env keys
- --warn-missing: show missing env files
- -h, --help: show help

### Examples

```bash
# Load env then run node
npx envlayer --env=uat --cwd ./config -- node dist/main.js

# Inline command
npx envlayer --env=development -- node -e "console.log(process.env.MY_KEY)"

npx envlayer --env=production --require DB_URL --require PORT -- node dist/main.js
```

## Quick Start (Preload Hook)

```ts
node -r envlayer/register dist/main.js --env=uat
```

## Quick Start (Programmatic)

```bash
import { loadEnv } from "envlayer";

loadEnv();
```

## Environment Selection Priority
  
1. --env / -e
2. process.env.ENV
3. process.env.NODE_ENV
4. default: development

## File resolution order

For env = X:
  
1. .env.defaults
2. .env
3. .env.X
4. .env.local (skipped in production unless enabled)
5. .env.X.local (skipped in production unless enabled)

Later files override earlier ones.
Existing process.env variables are preserved by default.

## Options

```ts
loadEnv({
  required: ["DB_URL", "PORT"],
  throwOnError: true,
  env: "uat",
  applyToProcessEnv: true,
  overrideProcessEnv: false,
  allowLocalInProduction: false,
  warnOnMissing: false,
  strict: false,
  logLevel: "info"
});
```

## Roadmap

### v0.2

- CLI runner mode (envlayer --env=uat -- node app.js)

### v0.3

- Required key validation

### v1.0

- Stable API
- Full test coverage
- Benchmarks vs dotenv

### v1.1

- Schema validation + casting (zero dependencies)

### v1.2

- Variable expansion (${VAR}) with cycle detection

## Security

- envlayer never logs environment variable values.
- envlayer does not override existing environment variables by default.
- Designed for production-safe defaults.

## License

MIT
