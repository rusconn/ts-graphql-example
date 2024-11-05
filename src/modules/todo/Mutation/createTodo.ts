import { ulid } from "ulid";

import type { Context } from "../../../context.ts";
import type { MutationCreateTodoArgs, MutationResolvers, ResolversTypes } from "../../../schema.ts";
import { type AuthContext, authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import { dateByUlid } from "../../common/resolvers.ts";

const TODOS_MAX = 10000;
const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "${TODOS_MAX}件まで"
    createTodo(input: CreateTodoInput!): CreateTodoResult
  }

  input CreateTodoInput {
    "${TITLE_MAX}文字まで"
    title: NonEmptyString!
    "${DESC_MAX}文字まで"
    description: String!
  }

  union CreateTodoResult = CreateTodoSuccess | TodoLimitExceededError

  type CreateTodoSuccess {
    todo: Todo!
  }

  type TodoLimitExceededError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["createTodo"] = async (_parent, args, context) => {
  const authed = authorize(context);

  const parsed = parseArgs(args);

  return await logic(authed, parsed, context);
};

const authorize = (context: AuthContext) => {
  return authAuthenticated(context);
};

const parseArgs = (args: MutationCreateTodoArgs) => {
  const { title, description } = args.input;

  if ([...title].length > TITLE_MAX) {
    throw parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if ([...description].length > DESC_MAX) {
    throw parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { title, description };
};

const logic = async (
  authed: ReturnType<typeof authorize>,
  parsed: ReturnType<typeof parseArgs>,
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
      __typename: "TodoLimitExceededError",
      message: "the number of todos exceeded the limit",
    };
  }

  const id = ulid();
  const idDate = dateByUlid(id);

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
  const { ErrorCode } = await import("../../../schema.ts");
  const { context } = await import("../../common/testData/context.ts");

  const valid = {
    args: { input: { title: "title", description: "description" } } as MutationCreateTodoArgs,
    user: context.admin,
  };

  describe("Parsing", () => {
    const validInput = valid.args.input;

    const valids = [
      { ...validInput },
      { ...validInput, title: "A".repeat(TITLE_MAX) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX) },
      { ...validInput, description: "A".repeat(DESC_MAX) },
      { ...validInput, description: "🅰".repeat(DESC_MAX) },
    ] as MutationCreateTodoArgs["input"][];

    const invalids = [
      { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX + 1) },
      { ...validInput, description: "A".repeat(DESC_MAX + 1) },
      { ...validInput, description: "🅰".repeat(DESC_MAX + 1) },
    ] as MutationCreateTodoArgs["input"][];

    test.each(valids)("valids %#", (input) => {
      parseArgs({ input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });

  describe("Maximum num todos", () => {
    const validInput = valid.args.input;

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

      expect(result?.__typename === "TodoLimitExceededError").toBe(true);
    });
  });
}
