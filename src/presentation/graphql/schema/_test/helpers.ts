import type { Transaction } from "kysely";
import type { Result } from "neverthrow";

import { createAppContext } from "../../../../infrastructure/context.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";
import type { Context } from "../../yoga/context.ts";
import type { ParseErr } from "../_parsers/_shared/error.ts";
import type { ContextForIT } from "./data/context/dynamic.ts";
import * as todos from "./data/graph/todos.ts";
import * as users from "./data/graph/users.ts";

export function testParseArgs<Args>(
  parseArgs: (args: Args) => Result<unknown, ParseErr | ParseErr[]>,
  cases: {
    valids: Args[];
    invalids: [Args, (keyof Args)[]][];
  },
) {
  describe("parsing", () => {
    it.each(cases.valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(cases.invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      const err = parsed._unsafeUnwrapErr();
      const errs = Array.isArray(err) ? err : [err];
      expect(errs.map((e) => e.field)).toStrictEqual(fields);
    });
  });
}

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

export function createContext(ctx: ContextForIT, trx: Transaction<DB>): Context {
  return {
    request: ctx.request,
    logger: pino,
    ...createAppContext({ user: ctx.user, kysely: trx }),
  } as Context;
}
