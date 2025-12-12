import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { tokenHashSalt } from "../../config/hash.ts";
import * as Uuidv4 from "../../lib/uuid/v4.ts";

export type Token = Tagged<Uuidv4.Uuidv4, "Token">;
export type TokenHashed = Tagged<Token, "Hashed">;

export const gen = () => {
  return Uuidv4.gen() as Token;
};

export const is = (input: unknown): input is Token => {
  return Uuidv4.is(input);
};

export const hash = async (genned: Token) => {
  const hashed = await bcrypt.hash(genned, tokenHashSalt);
  return hashed as TokenHashed;
};

export const match = async (source: string, hashed: TokenHashed) => {
  return await bcrypt.compare(source, hashed);
};
