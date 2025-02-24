import process from "node:process";

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

if (!isDev && !isTest && !isProd) {
  throw new Error("Invalid NODE_ENV");
}

export { isDev, isProd, isTest };
