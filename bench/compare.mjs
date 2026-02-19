import { performance } from "node:perf_hooks";
import path from "node:path";
import process from "node:process";

const cwd = path.resolve("bench/fixtures");
const N = 2000;

function resetEnv(keys) {
  for (const k of keys) delete process.env[k];
}

function bench(name, fn) {
  // warmup
  for (let i = 0; i < 200; i++) fn();

  const t0 = performance.now();
  for (let i = 0; i < N; i++) fn();
  const t1 = performance.now();

  const total = t1 - t0;
  const per = total / N;
  console.log(`${name}: total=${total.toFixed(1)}ms | avg=${per.toFixed(4)}ms/op`);
}

const keys = ["A","B","C","D","E","Z"];

// envlayer
const { loadEnv } = await import("../dist/index.js");

// dotenv
import dotenv from "dotenv";

// dotenv-flow
import dotenvFlow from "dotenv-flow";

console.log(`bench cwd=${cwd} iterations=${N}`);

bench("envlayer", () => {
  resetEnv(keys);
  loadEnv({ cwd, env: "uat", logLevel: "silent" });
});

bench("dotenv (manual layering)", () => {
  resetEnv(keys);
  dotenv.config({ path: path.join(cwd, ".env.defaults") });
  dotenv.config({ path: path.join(cwd, ".env") });
  dotenv.config({ path: path.join(cwd, ".env.uat") });
  dotenv.config({ path: path.join(cwd, ".env.local") });
  dotenv.config({ path: path.join(cwd, ".env.uat.local") });
});

bench("dotenv-flow", () => {
  resetEnv(keys);
  dotenvFlow.config({ node_env: "uat", path: cwd });
});