import process from "node:process";

const { SIGNING_KEY } = process.env;

if (SIGNING_KEY == null) {
  throw new Error("Invalid SIGNING_KEY");
}

const signingKey = new TextEncoder().encode(SIGNING_KEY);

export { signingKey };

const { NODE_ENV } = process.env;
const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

if (!isDev && !isTest && !isProd) {
  throw new Error("Invalid NODE_ENV");
}

export { isDev, isProd, isTest };

const {
  PORT = "4000",
  MAX_DEPTH = "10",
  MAX_COST = "10000",
  PASS_HASH_EXP = "10",
  TOKEN_HASH_SALT,
} = process.env;

if (TOKEN_HASH_SALT == null) {
  throw new Error("Invalid TOKEN_HASH_SALT");
}
const port = Number(PORT);
const maxDepth = Number(MAX_DEPTH);
const maxCost = Number(MAX_COST);
const passHashExp = Number(PASS_HASH_EXP);
const tokenHashSalt = TOKEN_HASH_SALT;

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

export { maxCost, maxDepth, passHashExp, port, tokenHashSalt };

const { DATABASE_URL } = process.env;

if (DATABASE_URL == null) {
  throw new Error("Invalid DATABASE_URL");
}

export { DATABASE_URL as connectionString };

const { DOMAIN, BASE_URL } = process.env;

if (DOMAIN == null) {
  throw new Error("Invalid DOMAIN_NAME");
}
if (BASE_URL == null) {
  throw new Error("Invalid BASE_URL");
}

const domain = DOMAIN;
const endpoint = `${BASE_URL}:${port}/graphql`;

export { domain, endpoint };
