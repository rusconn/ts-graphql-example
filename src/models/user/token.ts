import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { tokenHashSalt } from "../../config/hash.ts";
import * as Uuidv4 from "../../lib/uuid/v4.ts";

export type UserToken = Tagged<Uuidv4.Uuidv4, "UserToken">;
export type UserTokenHashed = Tagged<string, "UserTokenHashed">;

export const gen = () => {
  return Uuidv4.gen() as UserToken;
};

export const is = (input: unknown): input is UserToken => {
  return Uuidv4.is(input);
};

export const hash = async (gened: UserToken) => {
  const hashed = await bcrypt.hash(gened, tokenHashSalt);
  return hashed as UserTokenHashed;
};
