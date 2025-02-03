import process from "node:process";

const { NODE_ENV } = process.env;
const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

if (!isDev && !isTest && !isProd) {
  throw new Error("Invalid NODE_ENV");
}

export { isDev, isProd, isTest };

const { PORT = "4000", MAX_DEPTH = "10", MAX_COST = "10000", PASS_HASH_EXP = "10" } = process.env;
const port = Number(PORT);
const maxDepth = Number(MAX_DEPTH);
const maxCost = Number(MAX_COST);
const passHashExp = Number(PASS_HASH_EXP);

if (Number.isNaN(port)) {
  throw new Error("Invalid PORT");
}
if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}
if (Number.isNaN(maxCost)) {
  throw new Error("Invalid MAX_COST");
}
if (Number.isNaN(passHashExp) || (isProd && (passHashExp < 10 || 14 < passHashExp))) {
  throw new Error("Invalid PASS_HASH_EXP");
}

export { maxCost, maxDepth, passHashExp, port };

const { DATABASE_URL } = process.env;

if (DATABASE_URL == null) {
  throw new Error("Invalid DATABASE_URL");
}

export { DATABASE_URL as connectionString };

const { BASE_URL } = process.env;

if (BASE_URL == null) {
  throw new Error("Invalid BASE_URL");
}

const endpoint = `${BASE_URL}:${port}/graphql`;

export { endpoint };
