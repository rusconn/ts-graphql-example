import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../../util/uuid/v7.ts";
import { type InvalidFormatError, invalidFormatError } from "../_shared/parse-errors.ts";

export type Type = Tagged<Uuidv7.Uuidv7, "UserId">;

export const is = (input: unknown): input is Type => {
  return Uuidv7.is(input);
};

export const parse = (input: unknown): Result<Type, ParseError> => {
  return is(input) ? ok(input) : err(invalidFormatError);
};

export type ParseError = InvalidFormatError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};

export const create = () => {
  return Uuidv7.gen() as Type;
};

export const createWithDate = () => {
  const id = create();
  return {
    id,
    date: date(id),
  };
};

export const date = (id: Type) => {
  return Uuidv7.date(id);
};
