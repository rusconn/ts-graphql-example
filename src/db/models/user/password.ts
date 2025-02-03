import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { passHashExp } from "../../../config.ts";

export type UserPassword = Tagged<string, "UserPassword">;

export const gen = async (plainPassword: string) => {
  const hashed = await bcrypt.hash(plainPassword, passHashExp);
  return hashed as UserPassword;
};
