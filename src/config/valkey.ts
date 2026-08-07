import * as env from "../util/envvar.ts";

export const host = env.get("VALKEY_HOST");
export const port = env.getInt("VALKEY_PORT");
export const useTLS = env.getBool("VALKEY_USE_TLS");
