import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { tokenHashSalt } from "../../config/hash.ts";
import * as Uuidv4 from "../../lib/uuid/v4.ts";

export type RefreshToken = Tagged<Uuidv4.Uuidv4, "RefreshToken">;
export type RefreshTokenHashed = Tagged<RefreshToken, "Hashed">;

export const gen = () => {
  return Uuidv4.gen() as RefreshToken;
};

export const is = (input: unknown): input is RefreshToken => {
  return Uuidv4.is(input);
};

export const hash = async (genned: RefreshToken) => {
  const hashed = await bcrypt.hash(genned, tokenHashSalt);
  return hashed as RefreshTokenHashed;
};

export const match = async (source: string, hashed: RefreshTokenHashed) => {
  return await bcrypt.compare(source, hashed);
};
