import process from "node:process";

import { isProd } from "./env.ts";

const { PASS_HASH_EXP, TOKEN_HASH_SALT } = process.env;

if (TOKEN_HASH_SALT == null) {
  throw new Error("Invalid TOKEN_HASH_SALT");
}

const passHashExp = Number(PASS_HASH_EXP);
const tokenHashSalt = TOKEN_HASH_SALT;

if (Number.isNaN(passHashExp) || (isProd && (passHashExp < 10 || 14 < passHashExp))) {
  throw new Error("Invalid PASS_HASH_EXP");
}

export { passHashExp, tokenHashSalt };
