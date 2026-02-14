import { Result } from "neverthrow";

import { Todo } from "../../domain/models.ts";
import type { Context } from "../../server/context.ts";
import type { OkOf } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoCreateArgs, ResolversTypes } from "../_schema.ts";
import { invalidInputErrors } from "../_shared/errors.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ${Todo.MAX_COUNT}件まで
    """
    todoCreate(
      """
      ${Todo.Title.MAX}文字まで
      """
      title: String! = ""

      """
      ${Todo.Description.MAX}文字まで
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
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  return await logic(ctx, parsed.value);
};

const authorize = (context: Context) => {
  return authAuthenticated(context);
};

const parseArgs = (args: MutationTodoCreateArgs) => {
  return Result.combineWithAllErrors([
    parseTodoTitle(args, "title", {
      optional: false,
      nullable: false,
    }),
    parseTodoDescription(args, "description", {
      optional: false,
      nullable: false,
    }),
  ]).map(([title, description]) => ({
    title,
    description,
  }));
};

const logic = async (
  ctx: Exclude<ReturnType<typeof authorize>, Error>,
  parsed: OkOf<ReturnType<typeof parseArgs>>,
): Promise<ResolversTypes["TodoCreateResult"]> => {
  const count = await ctx.queries.todo.count();
  if (count >= Todo.MAX_COUNT) {
    return {
      __typename: "ResourceLimitExceededError",
      message: `The number of todos exceeds the maximum number of ${Todo.MAX_COUNT}.`,
    };
  }

  const user = await ctx.queries.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const todo = Todo.create(user.id, parsed);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.add(todo);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "TodoCreateSuccess",
    todo,
    todoEdge: {
      cursor: todo.id,
      node: todo,
    },
  };
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const valid = {
    args: {
      title: "title",
      description: "description",
    } as OkOf<ReturnType<typeof parseArgs>>,
    user: context.admin.user,
  };

  const invalid = {
    args: {
      title: "A".repeat(Todo.Title.MAX + 1),
      description: "A".repeat(Todo.Description.MAX + 1),
    },
  };

  describe("Parsing", () => {
    const valids: MutationTodoCreateArgs[] = [
      { ...valid.args },
      { ...valid.args, title: "A".repeat(Todo.Title.MAX) },
      { ...valid.args, description: "A".repeat(Todo.Description.MAX) },
    ];

    const invalids: [MutationTodoCreateArgs, (keyof MutationTodoCreateArgs)[]][] = [
      [{ ...valid.args, title: invalid.args.title }, ["title"]],
      [{ ...valid.args, description: invalid.args.description }, ["description"]],
      [{ ...valid.args, ...invalid.args }, ["title", "description"]],
    ];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });

  describe("Maximum num todos", () => {
    const createQueries = (num: number) => ({
      todo: {
        count: async () => num,
        find: async () => ({}),
      },
      user: {
        findByDbId: async () => ({ id: "dummy" }),
      },
    });

    const createRepos = () => ({
      todo: {
        add: async () => "Ok",
      },
    });

    const notExceededs = [0, 1, Todo.MAX_COUNT - 1];
    const exceededs = [Todo.MAX_COUNT, Todo.MAX_COUNT + 1];

    type Ctx = Exclude<ReturnType<typeof authorize>, Error>;

    test.each(notExceededs)("notExceededs %#", async (num) => {
      const queries = createQueries(num);
      const repos = createRepos();
      const result = await logic(
        { user: valid.user, queries, repos } as unknown as Ctx,
        valid.args,
      );
      expect(result?.__typename).not.toBe("ResourceLimitExceededError");
    });

    test.each(exceededs)("exceededs %#", async (num) => {
      const queries = createQueries(num);
      const repos = createRepos();
      const result = await logic(
        { user: valid.user, queries, repos } as unknown as Ctx,
        valid.args,
      );
      expect(result?.__typename).toBe("ResourceLimitExceededError");
    });
  });
}
