import type {
  ConnectionArguments,
  ConnectionArgumentsUnion,
} from "../../lib/graphql/cursorConnections/interfaces.ts";
import {
  isForwardPagination,
  parseConnectionArguments,
} from "../../lib/graphql/cursorConnections/util.ts";
import { parseErr } from "./util.ts";

type Config<Cursor> = {
  firstMax: number;
  lastMax: number;
  parseCursor: (cursor: string) => Cursor | Error;
};

export const parseConnectionArgs = <Cursor>(args: ConnectionArguments, config: Config<Cursor>) => {
  const result = parseConnectionArguments(args);

  if (result instanceof Error) {
    return parseErr(result.message);
  }

  return parseUsingConfig(result, config);
};

const parseUsingConfig = <Cursor>(args: ConnectionArgumentsUnion, config: Config<Cursor>) => {
  const { firstMax, lastMax, parseCursor } = config;

  if (isForwardPagination(args)) {
    const { first, after } = args;

    if (first > firstMax) {
      return parseErr(`"first" must be up to ${firstMax}`);
    }

    const parsedAfter = after != null ? parseCursor(after) : after;

    if (parsedAfter instanceof Error) {
      return parsedAfter;
    }

    return { first, ...(after != null && { after: parsedAfter }) };
  } else {
    const { last, before } = args;

    if (last > lastMax) {
      return parseErr(`"last" must be up to ${lastMax}`);
    }

    const parsedBefore = before != null ? parseCursor(before) : before;

    if (parsedBefore instanceof Error) {
      return parsedBefore;
    }

    return { last, ...(before != null && { before: parsedBefore }) };
  }
};

if (import.meta.vitest) {
  describe("parseUsingConfig", () => {
    const valids = [
      { first: 30 }, //
      { last: 30 },
    ];

    const invalids = [
      { first: 31 }, //
      { last: 31 },
    ];

    test.each(valids)("valids %#", async (args) => {
      const result = parseUsingConfig(args, {
        firstMax: 30,
        lastMax: 30,
        parseCursor: (cursor) => cursor,
      });
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = parseUsingConfig(args, {
        firstMax: 30,
        lastMax: 30,
        parseCursor: (cursor) => cursor,
      });
      expect(result instanceof Error).toBe(true);
    });
  });
}
