import {
  type ConnectionArguments,
  type ConnectionArgumentsUnion,
  isForwardPagination,
  parseArgs,
  parseErrorMessage,
} from "../../lib/graphql/cursor-connections/mod.ts";

type Config<Cursor> = {
  firstMax: number;
  lastMax: number;
  parseCursor: (cursor: string) => Cursor | Error;
};

export const parseConnectionArgs = <Cursor>(args: ConnectionArguments, config: Config<Cursor>) => {
  const result = parseArgs(args);
  if (!result.ok) {
    return new Error(parseErrorMessage[result.err]);
  }

  return parseArgsAdditional(result.val, config);
};

const parseArgsAdditional = <Cursor>(args: ConnectionArgumentsUnion, config: Config<Cursor>) => {
  const { firstMax, lastMax, parseCursor } = config;

  if (isForwardPagination(args)) {
    const { first, after } = args;
    if (first > firstMax) {
      return new Error(`first cannot exceed ${firstMax}`);
    }

    const parsedAfter = after != null ? parseCursor(after) : after;
    if (Error.isError(parsedAfter)) {
      return parsedAfter;
    }

    return {
      first,
      ...(after != null && {
        after: parsedAfter,
      }),
    };
  } else {
    const { last, before } = args;
    if (last > lastMax) {
      return new Error(`last cannot exceed ${lastMax}`);
    }

    const parsedBefore = before != null ? parseCursor(before) : before;
    if (Error.isError(parsedBefore)) {
      return parsedBefore;
    }

    return {
      last,
      ...(before != null && {
        before: parsedBefore,
      }),
    };
  }
};

if (import.meta.vitest) {
  const firstMax = 30;
  const lastMax = 30;

  const valids = [
    { first: firstMax }, //
    { last: lastMax },
  ];

  const invalids = [
    { first: firstMax + 1 }, //
    { last: lastMax + 1 },
  ];

  test.each(valids)("valids %#", async (args) => {
    const result = parseArgsAdditional(args, {
      firstMax,
      lastMax,
      parseCursor: (cursor) => cursor,
    });
    expect(Error.isError(result)).toBe(false);
  });

  test.each(invalids)("invalids %#", async (args) => {
    const result = parseArgsAdditional(args, {
      firstMax,
      lastMax,
      parseCursor: (cursor) => cursor,
    });
    expect(Error.isError(result)).toBe(true);
  });
}
