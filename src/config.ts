import process from "node:process";

type NodeEnv = (typeof validNodeEnvs)[number];

const validNodeEnvs = ["development", "test", "production"] as const;

const isValidNodeEnv = (val: string | undefined): val is NodeEnv => {
  return val != null && validNodeEnvs.includes(val as NodeEnv);
};

const { PORT, MAX_DEPTH, MAX_COST, NODE_ENV, PASS_HASH_EXP, DB_PORT, DB_NAME } = process.env;

const port = Number(PORT ?? "4000");
const maxDepth = Number(MAX_DEPTH ?? "10");
const maxCost = Number(MAX_COST ?? "10000");
const passHashExp = Number(PASS_HASH_EXP ?? "10");

if (Number.isNaN(port)) {
  throw new Error("Invalid PORT");
}
if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}
if (Number.isNaN(maxCost)) {
  throw new Error("Invalid MAX_COST");
}
if (!isValidNodeEnv(NODE_ENV)) {
  throw new Error("Invalid NODE_ENV");
}

const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

if (Number.isNaN(passHashExp) || (isProd && (passHashExp < 10 || 14 < passHashExp))) {
  throw new Error("Invalid PASS_HASH_EXP");
}

const connectionString = `postgresql://postgres:pass@localhost:${DB_PORT}/${DB_NAME}`;

export { port, maxDepth, maxCost, passHashExp, isDev, isTest, isProd, connectionString };
