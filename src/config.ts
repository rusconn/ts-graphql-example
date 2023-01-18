const validNodeEnvs = ["development", "test", "production"] as const;

export type NodeEnv = typeof validNodeEnvs[number];

const isValidNodeEnv = (val: string): val is NodeEnv =>
  val != null && validNodeEnvs.includes(val as NodeEnv);

const { MAX_DEPTH, MAX_COST, ALERT_COST, NODE_ENV } = process.env;

const maxDepth = Number(MAX_DEPTH ?? "10");
const maxCost = Number(MAX_COST ?? "10000");
const alertCost = Number(ALERT_COST ?? "5000");

if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}

if (Number.isNaN(maxCost)) {
  throw new Error("Invalid MAX_COST");
}

if (Number.isNaN(alertCost)) {
  throw new Error("Invalid ALERT_COST");
}

if (!NODE_ENV || !isValidNodeEnv(NODE_ENV)) {
  throw new Error("Invalid NODE_ENV");
}

const nodeEnv = NODE_ENV;

export { maxDepth, maxCost, alertCost, nodeEnv };
