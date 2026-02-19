import type { ConnectionArguments, ConnectionArgumentsUnion } from "./interfaces.ts";

export const parseArgs = (
  args: ConnectionArguments,
): Result<ConnectionArgumentsUnion, ParseError> => {
  const { first, after, last, before } = args;

  if (first == null && last == null) {
    return err("BOTH_FIRST_AND_LAST_ABSENT");
  }
  if (first != null && last != null) {
    return err("BOTH_FIRST_AND_LAST_EXISTS");
  }

  if (first != null) {
    if (before != null) {
      return err("FIRST_WITH_BEFORE");
    }
    if (first < 0) {
      return err("NEGATIVE_FIRST");
    }

    return ok({
      first,
      ...(after != null && {
        after,
      }),
    });
  }
  if (last != null) {
    if (after != null) {
      return err("LAST_WITH_AFTER");
    }
    if (last < 0) {
      return err("NEGATIVE_LAST");
    }

    return ok({
      last,
      ...(before != null && {
        before,
      }),
    });
  }

  throw new Error("unreachable");
};

export type ParseError =
  | "BOTH_FIRST_AND_LAST_ABSENT"
  | "BOTH_FIRST_AND_LAST_EXISTS"
  | "FIRST_WITH_BEFORE"
  | "LAST_WITH_AFTER"
  | "NEGATIVE_FIRST"
  | "NEGATIVE_LAST";

export const defaultMessages: Record<ParseError, string> = {
  BOTH_FIRST_AND_LAST_ABSENT: "you must provide one of first or last",
  BOTH_FIRST_AND_LAST_EXISTS: "providing both first and last is not supported",
  FIRST_WITH_BEFORE: "using first with before is not supported",
  LAST_WITH_AFTER: "using last with after is not supported",
  NEGATIVE_FIRST: "first cannot be negative",
  NEGATIVE_LAST: "last cannot be negative",
};

export type Result<T, E> =
  | { ok: true; val: T } //
  | { ok: false; err: E };

export const ok = <T>(val: T): Result<T, never> => {
  return { ok: true, val };
};

export const err = <E>(err: E): Result<never, E> => {
  return { ok: false, err };
};

if (import.meta.vitest) {
  const valids = [
    { first: 0 },
    { first: 10 },
    { first: 10, after: "" },
    { first: 10, after: "", last: null, before: null },
    { last: 0 },
    { last: 10 },
    { last: 10, before: "" },
    { last: 10, before: "" },
    { last: 10, before: "", first: null, after: null },
  ];

  const invalids = [
    {},
    { before: "" },
    { after: "" },
    { first: null },
    { first: -1 },
    { first: 10, before: "" },
    { first: 10, after: "", before: "" },
    { last: null },
    { last: -1 },
    { last: 10, after: "" },
    { last: 10, before: "", after: "" },
    { first: null, last: null },
    { first: 10, last: 10 },
  ];

  test.each(valids)("valids %#", async (args) => {
    const result = parseArgs(args);
    expect(result.ok).toBe(true);
  });

  test.each(invalids)("invalids %#", async (args) => {
    const result = parseArgs(args);
    expect(result.ok).toBe(false);
  });
}
