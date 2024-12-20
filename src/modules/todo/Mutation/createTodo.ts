import { v7 as uuidv7 } from "uuid";

import type { Context } from "../../../context.ts";
import type { MutationCreateTodoArgs, MutationResolvers, ResolversTypes } from "../../../schema.ts";
import { type AuthContext, authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid, forbiddenErr } from "../../common/resolvers.ts";

const TODOS_MAX = 10000;
const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "${TODOS_MAX}件まで"
    createTodo(
      "${TITLE_MAX}文字まで"
      title: NonEmptyString!

      "${DESC_MAX}文字まで"
      description: String! = ""
    ): CreateTodoResult
  }

  union CreateTodoResult = CreateTodoSuccess | InvalidInputError | ResourceLimitExceededError

  type CreateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["createTodo"] = async (_parent, args, context) => {
  const authed = authorize(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  return await logic(authed, parsed, context);
};

const authorize = (context: AuthContext) => {
  return authAuthenticated(context);
};

const parseArgs = (args: MutationCreateTodoArgs) => {
  const { title, description } = args;

  if (numChars(title) > TITLE_MAX) {
    return parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if (numChars(description) > DESC_MAX) {
    return parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { title, description };
};

const logic = async (
  authed: Exclude<ReturnType<typeof authorize>, Error>,
  parsed: Exclude<ReturnType<typeof parseArgs>, Error>,
  context: Context,
): Promise<ResolversTypes["CreateTodoResult"]> => {
  const { title, description } = parsed;

  const count = await context.db
    .selectFrom("Todo")
    .where("userId", "=", authed.id)
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow()
    .then((result) => Number(result.count));

  if (count >= TODOS_MAX) {
    return {
      __typename: "ResourceLimitExceededError",
      message: "the number of todos exceeded the limit",
    };
  }

  const id = uuidv7();
  const idDate = dateByUuid(id);

  const todo = await context.db
    .insertInto("Todo")
    .values({
      id,
      updatedAt: idDate,
      userId: authed.id,
      title,
      description,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "CreateTodoSuccess",
    todo,
  };
};

if (import.meta.vitest) {
  const { context } = await import("../../common/testData/context.ts");

  const valid = {
    args: { title: "title", description: "description" } as MutationCreateTodoArgs,
    user: context.admin,
  };

  describe("Parsing", () => {
    const validInput = valid.args;

    const valids = [
      { ...validInput },
      { ...validInput, title: "A".repeat(TITLE_MAX) },
      { ...validInput, description: "A".repeat(DESC_MAX) },
    ] as MutationCreateTodoArgs[];

    const invalids = [
      { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
      { ...validInput, description: "A".repeat(DESC_MAX + 1) },
    ] as MutationCreateTodoArgs[];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(true);
    });
  });

  describe("Maximum num todos", () => {
    const validInput = valid.args;

    const createDb = (num: number) =>
      ({
        selectFrom: () => ({
          where: () => ({
            select: () => ({
              executeTakeFirstOrThrow: async () => ({ count: num }),
            }),
          }),
        }),
        insertInto: () => ({
          values: () => ({
            returningAll: () => ({
              executeTakeFirstOrThrow: async () => {},
            }),
          }),
        }),
      }) as unknown as Context["db"];

    const notExceededs = [0, 1, TODOS_MAX - 1];
    const exceededs = [TODOS_MAX, TODOS_MAX + 1];

    test.each(notExceededs)("notExceededs %#", async (num) => {
      const db = createDb(num);

      await logic(valid.user, validInput, { db } as Context);
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const db = createDb(num);

      const result = await logic(valid.user, validInput, { db } as Context);

      expect(result?.__typename === "ResourceLimitExceededError").toBe(true);
    });
  });
}
