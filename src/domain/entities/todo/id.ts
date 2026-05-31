import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../../util/uuid/v7.ts";
import { type InvalidFormatError, invalidFormatError } from "../_shared/parse-errors.ts";

export type Type = Tagged<Uuidv7.Uuidv7, "TodoId">;

export function is(input: unknown): input is Type {
  return Uuidv7.is(input);
}

export function parse(input: unknown): Result<Type, ParseError> {
  return is(input) ? ok(input) : err(invalidFormatError);
}

export type ParseError = InvalidFormatError;

export function parseOrThrow(input: unknown): Type {
  return parse(input)._unsafeUnwrap();
}

export function create() {
  return Uuidv7.gen() as Type;
}

export function createWithDate() {
  const id = create();
  return {
    id,
    date: date(id),
  };
}

export function date(id: Type) {
  return Uuidv7.date(id);
}
