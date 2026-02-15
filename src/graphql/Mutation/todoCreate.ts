import { Result } from "neverthrow";

import * as Dto from "../../application/queries/dto.ts";
import { Todo } from "../../domain/entities.ts";
import type { ContextForAuthed } from "../../server/context.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoCreateArgs } from "../_schema.ts";

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
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  return await logic(ctx, parsed.value);
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
  ctx: ContextForAuthed,
  input: Parameters<typeof Todo.create>[1],
): Promise<ReturnType<MutationResolvers["todoCreate"]>> => {
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

  const todo = Todo.create(user.id, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.add(todo);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  const todoDto = Dto.Todo.fromDomain(todo);

  return {
    __typename: "TodoCreateSuccess",
    todo: todoDto,
    todoEdge: {
      cursor: todo.id,
      node: todoDto,
    },
  };
};

if (import.meta.vitest) {
  const { context } = await import("../_test/data.ts");

  const valid = {
    args: {
      title: "foo",
      description: "bar",
    } as Parameters<typeof logic>[1],
    user: context.admin.user,
  };

  const invalid = {
    args: {
      title: "a".repeat(Todo.Title.MAX + 1),
      description: "a".repeat(Todo.Description.MAX + 1),
    },
  };

  describe("parsing", () => {
    const valids: MutationTodoCreateArgs[] = [
      { ...valid.args },
      { ...valid.args, title: "a".repeat(Todo.Title.MAX) },
      { ...valid.args, description: "a".repeat(Todo.Description.MAX) },
    ];

    const invalids: [MutationTodoCreateArgs, (keyof MutationTodoCreateArgs)[]][] = [
      [{ ...valid.args, title: invalid.args.title }, ["title"]],
      [{ ...valid.args, description: invalid.args.description }, ["description"]],
      [{ ...valid.args, ...invalid.args }, ["title", "description"]],
    ];

    it.each(valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      expect(parsed._unsafeUnwrapErr().map((e) => e.field)).toStrictEqual(fields);
    });
  });

  describe("logic", () => {
    describe("maximum count of todos", () => {
      const createQueries = (num: number) => ({
        todo: {
          count: async () => num,
          find: async () => ({}),
        },
        user: {
          find: async () => ({ id: "dummy" }),
        },
      });

      const createUnitOfWork = () => ({
        run: async () => {},
      });

      const notExceededs = [0, 1, Todo.MAX_COUNT - 1];
      const exceededs = [Todo.MAX_COUNT, Todo.MAX_COUNT + 1];

      it.each(notExceededs)("not exceededs: %#", async (num) => {
        const queries = createQueries(num);
        const unitOfWork = createUnitOfWork();
        const result = await logic(
          { user: valid.user, queries, unitOfWork } as unknown as ContextForAuthed,
          valid.args,
        );
        expect(result?.__typename).not.toBe("ResourceLimitExceededError");
      });

      it.each(exceededs)("exceededs: %#", async (num) => {
        const queries = createQueries(num);
        const unitOfWork = createUnitOfWork();
        const result = await logic(
          { user: valid.user, queries, unitOfWork } as unknown as ContextForAuthed,
          valid.args,
        );
        expect(result?.__typename).toBe("ResourceLimitExceededError");
      });
    });
  });
}
