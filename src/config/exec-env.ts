import * as env from "../util/envvar.ts";

const nodeEnv = env.get("NODE_ENV");

export const isDev = nodeEnv === "development";
export const isTest = nodeEnv === "test";
export const isProd = nodeEnv === "production";

if (!isDev && !isTest && !isProd) {
  throw new Error("Invalid NODE_ENV");
}
