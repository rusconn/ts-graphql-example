import * as env from "../lib/env/env.ts";
import { isProd } from "./env.ts";

export const passHashExp = env.getInt("PASS_HASH_EXP");
export const tokenHashSalt = env.get("TOKEN_HASH_SALT");

if (isProd && (passHashExp < 10 || 14 < passHashExp)) {
  throw new Error("Invalid PASS_HASH_EXP");
}
