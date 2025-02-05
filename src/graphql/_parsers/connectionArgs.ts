import type {
  ConnectionArguments,
  ConnectionArgumentsUnion,
} from "../../lib/graphql/cursorConnections/interfaces.ts";
import { isForwardPagination } from "../../lib/graphql/cursorConnections/util.ts";
import { parseErr } from "./util.ts";

type Config<Cursor> = {
  firstMax: number;
  lastMax: number;
  parseCursor: (cursor: string) => Cursor | Error;
};

export const parseConnectionArgs = <Cursor>(args: ConnectionArguments, config: Config<Cursor>) => {
  const result = parseConnectionArgsCommon(args);

  if (result instanceof Error) {
    return parseErr(result.message);
  }

  return parseConnectionArgsAdditional(result, config);
};

const parseConnectionArgsCommon = (args: ConnectionArguments) => {
  const { first, after, last, before } = args;

  if (first == null && last == null) {
    return new Error("you must provide one of first or last");
  }
  if (first != null && last != null) {
    return new Error("providing both first and last is not supported");
  }

  if (first != null) {
    if (before != null) {
      return new Error("using first with before is not supported");
    }
    if (first < 0) {
      return new Error("first cannot be negative");
    }

    return { first, ...(after != null && { after }) };
  }
  if (last != null) {
    if (after != null) {
      return new Error("using last with after is not supported");
    }
    if (last < 0) {
      return new Error("last cannot be negative");
    }

    return { last, ...(before != null && { before }) };
  }

  throw new Error("unreachable");
};

const parseConnectionArgsAdditional = <Cursor>(
  args: ConnectionArgumentsUnion,
  config: Config<Cursor>,
) => {
  const { firstMax, lastMax, parseCursor } = config;

  if (isForwardPagination(args)) {
    const { first, after } = args;

    if (first > firstMax) {
      return parseErr(`first cannot exceed ${firstMax}`);
    }

    const parsedAfter = after != null ? parseCursor(after) : after;

    if (parsedAfter instanceof Error) {
      return parsedAfter;
    }

    return { first, ...(after != null && { after: parsedAfter }) };
  } else {
    const { last, before } = args;

    if (last > lastMax) {
      return parseErr(`last cannot exceed ${lastMax}`);
    }

    const parsedBefore = before != null ? parseCursor(before) : before;

    if (parsedBefore instanceof Error) {
      return parsedBefore;
    }

    return { last, ...(before != null && { before: parsedBefore }) };
  }
};

if (import.meta.vitest) {
  describe("parseConnectionArgsCommon", () => {
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
      const result = parseConnectionArgsCommon(args);
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = parseConnectionArgsCommon(args);
      expect(result instanceof Error).toBe(true);
    });
  });

  describe("parseConnectionArgsAdditional", () => {
    const valids = [
      { first: 30 }, //
      { last: 30 },
    ];

    const invalids = [
      { first: 31 }, //
      { last: 31 },
    ];

    test.each(valids)("valids %#", async (args) => {
      const result = parseConnectionArgsAdditional(args, {
        firstMax: 30,
        lastMax: 30,
        parseCursor: (cursor) => cursor,
      });
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = parseConnectionArgsAdditional(args, {
        firstMax: 30,
        lastMax: 30,
        parseCursor: (cursor) => cursor,
      });
      expect(result instanceof Error).toBe(true);
    });
  });
}
