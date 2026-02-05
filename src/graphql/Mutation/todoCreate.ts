import type { Context } from "../../context.ts";
import * as Todo from "../../domain/todo.ts";
import type { MutationResolvers, MutationTodoCreateArgs, ResolversTypes } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoDescription, TODO_DESCRIPTION_MAX } from "../_parsers/todo/description.ts";
import { parseTodoTitle, TODO_TITLE_MAX } from "../_parsers/todo/title.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

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
      title: String! = ""

      """
      ${TODO_DESCRIPTION_MAX}文字まで
      """
      description: String! = ""
    ): TodoCreateResult @semanticNonNull @complexity(value: 5)
  }

  union TodoCreateResult = TodoCreateSuccess | InvalidInputErrors | ResourceLimitExceededError

  type TodoCreateSuccess {
    todo: Todo!
    todoEdge: TodoEdge!
  }
`;

export const resolver: MutationResolvers["todoCreate"] = async (_parent, args, context) => {
  const ctx = authorize(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  return await logic(ctx, parsed);
};

const authorize = (context: Context) => {
  return authAuthenticated(context);
};

const parseArgs = (args: MutationTodoCreateArgs) => {
  const title = parseTodoTitle(args, "title", {
    optional: false,
    nullable: false,
  });
  const description = parseTodoDescription(args, "description", {
    optional: false,
    nullable: false,
  });

  if (
    title instanceof ParseErr || //
    description instanceof ParseErr
  ) {
    const errors = [];

    if (title instanceof ParseErr) {
      errors.push(title);
    }
    if (description instanceof ParseErr) {
      errors.push(description);
    }

    return errors;
  } else {
    return { title, description };
  }
};

const logic = async (
  ctx: Exclude<ReturnType<typeof authorize>, Error>,
  parsed: Exclude<ReturnType<typeof parseArgs>, Error[]>,
): Promise<ResolversTypes["TodoCreateResult"]> => {
  const count = await ctx.queries.todo.count();
  if (count >= TODOS_MAX) {
    return {
      __typename: "ResourceLimitExceededError",
      message: `The number of todos exceeds the maximum number of ${TODOS_MAX}.`,
    };
  }

  const user = await ctx.repos.user.findByDbId(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const todo = Todo.create({ ...parsed, userId: user.id });
  const result = await ctx.repos.todo.save(todo);
  switch (result) {
    case "Ok":
      break;
    case "Failed":
    case "Forbidden":
    case "NotFound":
      throw internalServerError();
    default:
      throw new Error(result satisfies never);
  }

  const created = await ctx.queries.todo.find(todo.id);
  if (!created) {
    throw internalServerError();
  }

  return {
    __typename: "TodoCreateSuccess",
    todo: created,
    todoEdge: {
      cursor: todo.id,
      node: created,
    },
  };
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const valid = {
    args: { title: "title", description: "description" },
    user: context.admin.user,
  };

  const invalid = {
    args: {
      title: "A".repeat(TODO_TITLE_MAX + 1),
      description: "A".repeat(TODO_DESCRIPTION_MAX + 1),
    },
  };

  describe("Parsing", () => {
    const valids: MutationTodoCreateArgs[] = [
      { ...valid.args },
      { ...valid.args, title: "A".repeat(TODO_TITLE_MAX) },
      { ...valid.args, description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ];

    const invalids: [MutationTodoCreateArgs, (keyof MutationTodoCreateArgs)[]][] = [
      [{ ...valid.args, title: invalid.args.title }, ["title"]],
      [{ ...valid.args, description: invalid.args.description }, ["description"]],
      [{ ...valid.args, ...invalid.args }, ["title", "description"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });

  describe("Maximum num todos", () => {
    const createQueries = (num: number) => ({
      todo: {
        count: async () => num,
        find: async () => ({}),
      },
    });

    const createRepos = () =>
      ({
        todo: {
          save: async () => "Ok",
        },
        user: {
          findByDbId: async () => ({ id: "dummy" }),
        },
      }) as unknown as Context["repos"];

    const notExceededs = [0, 1, TODOS_MAX - 1];
    const exceededs = [TODOS_MAX, TODOS_MAX + 1];

    type Ctx = Exclude<ReturnType<typeof authorize>, Error>;

    test.each(notExceededs)("notExceededs %#", async (num) => {
      const queries = createQueries(num);
      const repos = createRepos();
      const result = await logic(
        { user: valid.user, queries, repos } as unknown as Ctx,
        valid.args,
      );
      expect(result?.__typename === "ResourceLimitExceededError").toBe(false);
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const queries = createQueries(num);
      const repos = createRepos();
      const result = await logic(
        { user: valid.user, queries, repos } as unknown as Ctx,
        valid.args,
      );
      expect(result?.__typename === "ResourceLimitExceededError").toBe(true);
    });
  });
}
