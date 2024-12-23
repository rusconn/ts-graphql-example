import type { Context } from "../../../context.ts";
import type { MutationCreateTodoArgs, MutationResolvers, ResolversTypes } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import type { AuthContext } from "../../common/authorizers/types.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import * as todoId from "../internal/id.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../parsers/description.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../parsers/title.ts";

const TODOS_MAX = 10_000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ${TODOS_MAX}件まで
    """
    createTodo(
      """
      ${TODO_TITLE_MAX}文字まで
      """
      title: NonEmptyString!

      """
      ${TODO_DESCRIPTION_MAX}文字まで
      """
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
  const title = parseTodoTitle(args, {
    optional: false,
    nullable: false,
  });

  if (title instanceof Error) {
    return title;
  }

  const description = parseTodoDescription(args, {
    optional: false,
    nullable: false,
  });

  if (description instanceof Error) {
    return description;
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

  const { id, date } = todoId.genWithDate();

  const todo = await context.db
    .insertInto("Todo")
    .values({
      id,
      updatedAt: date,
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
    const valids = [
      { ...valid.args },
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ] as MutationCreateTodoArgs[];

    const invalids = [
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX + 1) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX + 1) },
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
      const result = await logic(valid.user, valid.args, { db } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(false);
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const db = createDb(num);
      const result = await logic(valid.user, valid.args, { db } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(true);
    });
  });
}
