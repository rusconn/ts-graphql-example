import * as env from "../util/envvar.ts";
import { isProd } from "./exec-env.ts";

export const passwordHashExp = env.getInt("PASSWORD_HASH_ROUNDS_EXPONENT");

if (isProd && (passwordHashExp < 10 || 14 < passwordHashExp)) {
  throw new Error("Invalid PASSWORD_HASH_ROUNDS_EXPONENT");
}
