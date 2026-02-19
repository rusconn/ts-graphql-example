import { Result } from "neverthrow";

import { createTodo } from "../../../../application/usecases/create-todo.ts";
import { Todo } from "../../../../domain/entities.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoCreateArgs } from "../_types.ts";

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
    throw forbiddenError(ctx);
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await createTodo(ctx, parsed.value);
  switch (result.type) {
    case "ResourceLimitExceeded":
      return {
        __typename: "ResourceLimitExceededError",
        message: `The number of todos exceeds the maximum number of ${result.limit}.`,
      };
    case "UserEntityNotFound":
      throw internalServerError();
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoCreateSuccess",
        todo: result.created,
        todoEdge: {
          cursor: result.created.id,
          node: result.created,
        },
      };
    default:
      throw new Error(result satisfies never);
  }
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

if (import.meta.vitest) {
  const { context } = await import("../_test/data.ts");

  const valid = {
    args: {
      title: "foo",
      description: "bar",
    } as Parameters<typeof createTodo>[1],
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
}
