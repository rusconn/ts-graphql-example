import * as env from "../util/envvar.ts";

const key = env.get("ACCESS_TOKEN_SIGNING_KEY");
export const signingKey = new TextEncoder().encode(key);
