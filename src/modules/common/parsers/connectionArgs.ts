import type { ConnectionArguments } from "../../../lib/graphql/cursorConnections/interfaces.ts";
import { parseErr } from "./util.ts";

type Config<T> = {
  firstMax: number;
  lastMax: number;
  parseCursor: (cursor: string) => T | Error;
};

export const parseConnectionArgs = <T>(args: ConnectionArguments, config: Config<T>) => {
  const { first, after, last, before } = args;
  const { firstMax, lastMax, parseCursor } = config;

  if (first && first > firstMax) {
    return parseErr(`"first" must be up to ${firstMax}`);
  }
  if (last && last > lastMax) {
    return parseErr(`"last" must be up to ${lastMax}`);
  }

  const parsedAfter = after != null ? parseCursor(after) : after;

  if (parsedAfter instanceof Error) {
    return parsedAfter;
  }

  const parsedBefore = before != null ? parseCursor(before) : before;

  if (parsedBefore instanceof Error) {
    return parsedBefore;
  }

  return {
    first,
    after: parsedAfter,
    last,
    before: parsedBefore,
  };
};
