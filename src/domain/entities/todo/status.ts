import { err, ok, type Result } from "neverthrow";

export type Type = typeof DONE | typeof PENDING;

export const DONE = "DONE";
export const PENDING = "PENDING";

export function parse(input: string): Result<Type, ParseError> {
  switch (input) {
    case "done":
    case "Done":
    case "DONE":
      return ok(DONE);
    case "pending":
    case "Pending":
    case "PENDING":
      return ok(PENDING);
    default:
      return err(invalidStatusError);
  }
}

export type ParseError = typeof invalidStatusError;

export const invalidStatusError = {
  type: "invalid status",
} as const;

export function parseOrThrow(input: string): Type {
  return parse(input)._unsafeUnwrap();
}
