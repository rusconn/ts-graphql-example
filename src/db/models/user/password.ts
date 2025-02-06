import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { PASS_HASH_EXP } from "../../../config.ts";

export type UserPassword = Tagged<string, "UserPassword">;

export const gen = async (source: string) => {
  const hashed = await bcrypt.hash(source, PASS_HASH_EXP);
  return hashed as UserPassword;
};

export const match = async (source: string, gened: UserPassword) => {
  return await bcrypt.compare(source, gened);
};
