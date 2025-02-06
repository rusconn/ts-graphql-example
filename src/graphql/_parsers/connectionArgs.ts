import { type ZodSchema, type ZodTypeDef, z } from "zod";

import type { ConnectionArgumentsUnion } from "../../lib/graphql/cursorConnections/interfaces.ts";
import { isForwardPagination } from "../../lib/graphql/cursorConnections/util.ts";

type Config<Cursor> = {
  firstMax: number;
  lastMax: number;
  cursorSchema: ZodSchema<Cursor, ZodTypeDef, string>;
};

export const connectionArgsSchema = <Cursor>(config: Config<Cursor>) => {
  return connectionArgsCommonSchema.pipe(connectionArgsAdditionalSchema(config));
};

const connectionArgsCommonSchema = z
  .object({
    first: z.number().int().nonnegative().nullish(),
    after: z.string().nullish(),
    last: z.number().int().nonnegative().nullish(),
    before: z.string().nullish(),
  })
  .refine(({ first, last }) => first != null || last != null, {
    message: "you must provide one of first or last",
  })
  .refine(({ first, last }) => first == null || last == null, {
    message: "providing both first and last is not supported",
  })
  .superRefine(({ first, after, last, before }, ctx) => {
    if (first != null && before != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "using first with before is not supported",
      });
    }
    if (first != null && first < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "first cannot be negative",
      });
    }
    if (last != null && after != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "using last with after is not supported",
      });
    }
    if (last != null && last < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "last cannot be negative",
      });
    }
  })
  .transform((args) => args as ConnectionArgumentsUnion);

const connectionArgsAdditionalSchema2 = <Cursor>({
  firstMax,
  lastMax,
  cursorSchema,
}: Config<Cursor>) => {
  return z.union([
    z.object({
      first: z.number().int().nonnegative(),
      after: z.string().nullish(),
    }),
    z.object({
      last: z.number().int().nonnegative(),
      before: z.string().nullish(),
    }),
  ]);
};

const connectionArgsAdditionalSchema = <Cursor>({
  firstMax,
  lastMax,
  cursorSchema,
}: Config<Cursor>) => {
  if (isForwardPagination(args)) {
    const { first, after } = args;

    if (first > firstMax) {
      return new Error(`first cannot exceed ${firstMax}`);
    }

    const parsed = after != null ? cursorSchema.safeParse(after) : after;

    if (parsed != null && !parsed.success) {
      return parsed.error;
    }

    return { first, ...(parsed != null && { after: parsed.data }) };
  } else {
    const { last, before } = args;

    if (last > lastMax) {
      return new Error(`last cannot exceed ${lastMax}`);
    }

    const parsed = before != null ? cursorSchema.safeParse(before) : before;

    if (parsed != null && !parsed.success) {
      return parsed.error;
    }

    return { last, ...(parsed != null && { before: parsed.data }) };
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
        parseCursor: z.string(),
      });
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = parseConnectionArgsAdditional(args, {
        firstMax: 30,
        lastMax: 30,
        parseCursor: z.string(),
      });
      expect(result instanceof Error).toBe(true);
    });
  });
}
