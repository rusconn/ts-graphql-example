import type { ConnectionArguments, ConnectionArgumentsUnion } from "./interfaces.ts";

export const parseConnectionArguments = (args: ConnectionArguments) => {
  const { first, after, last, before } = args;

  if (first == null && last == null) {
    return new Error('One of "first" or "last" is required');
  }
  if (first != null && last != null) {
    return new Error('Only one of "first" and "last" can be set');
  }
  if (after != null && before != null) {
    return new Error('Only one of "after" and "before" can be set');
  }

  if (first != null) {
    if (before != null) {
      return new Error('"before" needs to be used with "last"');
    }
    if (first < 0) {
      return new Error('"first" has to be non-negative integer');
    }

    return { first, ...(after != null && { after }) };
  }
  if (last != null) {
    if (after != null) {
      return new Error('"after" needs to be used with "first"');
    }
    if (last < 0) {
      return new Error('"last" has to be non-negative integer');
    }

    return { last, ...(before != null && { before }) };
  }

  throw new Error("unreachable");
};

export function isForwardPagination<Cursor>(args: ConnectionArgumentsUnion<Cursor>) {
  return "first" in args;
}

if (import.meta.vitest) {
  describe("parseConnectionArguments", () => {
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
      const result = parseConnectionArguments(args);
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = parseConnectionArguments(args);
      expect(result instanceof Error).toBe(true);
    });
  });
}
