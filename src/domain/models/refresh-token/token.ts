import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { tokenHashSalt } from "../../../config/hash.ts";
import * as Uuidv4 from "../../../lib/uuid/v4.ts";
import * as Bcrypt from "../_shared/bcrypt.ts";

export type Type = Tagged<Uuidv4.Uuidv4, "RefreshToken">;
export type TypeHashed = Tagged<Type, "Hashed">;

export const parseHashed = Bcrypt.parseHashed<TypeHashed>;

export type ParseHashedError = Bcrypt.ParseHashedError;

export const parseHashedOrThrow = Bcrypt.parseHashedOrThrow<TypeHashed>;

export const create = () => {
  return Uuidv4.gen() as Type;
};

export const is = (input: unknown): input is Type => {
  return Uuidv4.is(input);
};

export const hash = async (source: Type) => {
  const hashed = await bcrypt.hash(source, tokenHashSalt);
  return hashed as TypeHashed;
};

export const match = async (source: string, hashed: TypeHashed) => {
  return await bcrypt.compare(source, hashed);
};
