import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { refreshTokenHashSalt } from "../../../config/refresh-token.ts";
import * as Uuidv4 from "../../../util/uuid/v4.ts";
import * as Bcrypt from "../_shared/bcrypt.ts";

export type Type = Tagged<Uuidv4.Uuidv4, "RefreshToken">;
export type TypeHashed = Tagged<Type, "Hashed">;

export const parseHashed = Bcrypt.parseHashed<TypeHashed>;

export type ParseHashedError = Bcrypt.ParseHashedError;

export const parseHashedOrThrow = Bcrypt.parseHashedOrThrow<TypeHashed>;

export function create() {
  return Uuidv4.gen() as Type;
}

export function is(input: unknown): input is Type {
  return Uuidv4.is(input);
}

export async function hash(source: Type) {
  const hashed = await bcrypt.hash(source, refreshTokenHashSalt);
  return hashed as TypeHashed;
}

export async function match(source: string, hashed: TypeHashed) {
  return await bcrypt.compare(source, hashed);
}
