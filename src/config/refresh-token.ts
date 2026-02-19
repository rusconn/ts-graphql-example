import * as env from "../util/envvar.ts";

export const refreshTokenHashSalt = env.get("REFRESH_TOKEN_HASH_SALT");
