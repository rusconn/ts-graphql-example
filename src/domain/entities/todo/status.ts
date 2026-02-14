import { ok, type Result } from "neverthrow";

export type Type = typeof DONE | typeof PENDING;

export const DONE = "DONE";
export const PENDING = "PENDING";

export const parse = (
  input:
    | "done" //
    | "pending"
    | "Done"
    | "Pending"
    | "DONE"
    | "PENDING",
): Result<Type, ParseError> => {
  return ok(
    input === "done" || //
      input === "Done" ||
      input === "DONE"
      ? DONE
      : PENDING,
  );
};

export type ParseError = never;

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};
