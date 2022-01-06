const validNodeEnvs = ["development", "production"] as const;
type NodeEnv = typeof validNodeEnvs[number];

export const getEnvsWithValidation = () => {
  const { MAX_DEPTH, MAX_COST, ALERT_COST, NODE_ENV } = process.env;

  const maxDepth = Number(MAX_DEPTH ?? "5");
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

  return { maxDepth, maxCost, alertCost, nodeEnv: NODE_ENV };
};

const isValidNodeEnv = (val: string): val is NodeEnv =>
  val != null && validNodeEnvs.includes(val as NodeEnv);
