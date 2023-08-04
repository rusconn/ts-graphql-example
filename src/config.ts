import process from "node:process";

const validNodeEnvs = ["development", "test", "production"] as const;

export type NodeEnv = typeof validNodeEnvs[number];

const isValidNodeEnv = (val: string): val is NodeEnv =>
  val != null && validNodeEnvs.includes(val as NodeEnv);

const { MAX_DEPTH, MAX_COST, ALERT_COST, NODE_ENV, PASSWORD_HASH_ROUNDS_EXPONENT } = process.env;

const maxDepth = Number(MAX_DEPTH ?? "10");
const maxCost = Number(MAX_COST ?? "10000");
const alertCost = Number(ALERT_COST ?? "5000");
const passwordHashRoundsExponent = Number(PASSWORD_HASH_ROUNDS_EXPONENT ?? "10");

if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}

if (Number.isNaN(maxCost)) {
  throw new Error("Invalid MAX_COST");
}

if (Number.isNaN(alertCost)) {
  throw new Error("Invalid ALERT_COST");
}

if (
  Number.isNaN(passwordHashRoundsExponent) ||
  passwordHashRoundsExponent < 10 ||
  passwordHashRoundsExponent > 14
) {
  throw new Error("Invalid PASSWORD_HASH_ROUNDS_EXPONENT");
}

if (!NODE_ENV || !isValidNodeEnv(NODE_ENV)) {
  throw new Error("Invalid NODE_ENV");
}

const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

export { maxDepth, maxCost, alertCost, passwordHashRoundsExponent, isDev, isTest, isProd };
