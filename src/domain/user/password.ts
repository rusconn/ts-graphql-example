import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { passHashExp } from "../../config/hash.ts";

export type UserPasswordHashed = Tagged<string, "UserPasswordHashed">;

export const hash = async (source: string) => {
  const hashed = await bcrypt.hash(source, passHashExp);
  return hashed as UserPasswordHashed;
};

export const match = async (source: string, hashed: UserPasswordHashed) => {
  return await bcrypt.compare(source, hashed);
};
