import type { Context } from "../../context.ts";
import type { MutationResolvers, MutationTodoCreateArgs, ResolversTypes } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import type { AuthContext } from "../_authorizers/types.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../_parsers/todo/description.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../_parsers/todo/title.ts";

const TODOS_MAX = 10_000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ${TODOS_MAX}件まで
    """
    todoCreate(
      """
      ${TODO_TITLE_MAX}文字まで
      """
      title: NonEmptyString!

      """
      ${TODO_DESCRIPTION_MAX}文字まで
      """
      description: String! = ""
    ): TodoCreateResult
  }

  union TodoCreateResult = TodoCreateSuccess | InvalidInputError | ResourceLimitExceededError

  type TodoCreateSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoCreate"] = async (_parent, args, context) => {
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

const parseArgs = (args: MutationTodoCreateArgs) => {
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
): Promise<ResolversTypes["TodoCreateResult"]> => {
  const { title, description } = parsed;

  const count = await context.api.todo.count(authed.id);

  if (count >= TODOS_MAX) {
    return {
      __typename: "ResourceLimitExceededError",
      message: "the number of todos exceeded the limit",
    };
  }

  const todo = await context.api.todo.create({
    title,
    description,
    userId: authed.id,
  });

  if (!todo) {
    throw internalServerError();
  }

  return {
    __typename: "TodoCreateSuccess",
    todo,
  };
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const valid = {
    args: { title: "title", description: "description" } as MutationTodoCreateArgs,
    user: context.admin,
  };

  describe("Parsing", () => {
    const valids = [
      { ...valid.args },
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ] as MutationTodoCreateArgs[];

    const invalids = [
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX + 1) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX + 1) },
    ] as MutationTodoCreateArgs[];

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
    const createAPIs = (num: number) =>
      ({
        todo: {
          count: async () => num,
          create: async () => ({ id: "dummy" }),
        },
      }) as unknown as Context["api"];

    const notExceededs = [0, 1, TODOS_MAX - 1];
    const exceededs = [TODOS_MAX, TODOS_MAX + 1];

    test.each(notExceededs)("notExceededs %#", async (num) => {
      const api = createAPIs(num);
      const result = await logic(valid.user, valid.args, { api } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(false);
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const api = createAPIs(num);
      const result = await logic(valid.user, valid.args, { api } as Context);
      expect(result?.__typename === "ResourceLimitExceededError").toBe(true);
    });
  });
}
