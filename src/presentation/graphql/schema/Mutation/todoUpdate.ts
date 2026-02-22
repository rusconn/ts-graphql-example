import { Result } from "neverthrow";

import { updateTodo } from "../../../../application/usecases/update-todo.ts";
import { Todo } from "../../../../domain/entities.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoUpdateArgs } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoUpdate(
      id: ID!

      """
      ${Todo.Title.MAX}文字まで、null は入力エラー
      """
      title: String

      """
      ${Todo.Description.MAX}文字まで、null は入力エラー
      """
      description: String

      """
      null は入力エラー
      """
      status: TodoStatus
    ): TodoUpdateResult @semanticNonNull @complexity(value: 5)
  }

  union TodoUpdateResult = TodoUpdateSuccess | InvalidInputErrors | ResourceNotFoundError

  type TodoUpdateSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoUpdate"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await updateTodo(ctx, { id, ...parsed.value });
  switch (result.type) {
    case "ResourceNotFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoUpdateSuccess",
        todo: result.updated,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationTodoUpdateArgs) => {
  return Result.combineWithAllErrors([
    parseTodoTitle(args, "title", {
      optional: true,
      nullable: false,
    }),
    parseTodoDescription(args, "description", {
      optional: true,
      nullable: false,
    }),
    parseTodoStatus(args, "status", {
      optional: true,
      nullable: false,
    }),
  ]).map(([title, description, status]) => ({
    ...(title != null && {
      title,
    }),
    ...(description != null && {
      description,
    }),
    ...(status != null && {
      status,
    }),
  }));
};

if (import.meta.vitest) {
  const { TodoStatus } = await import("../_types.ts");

  describe("parsing", () => {
    const id = Todo.Id.create();

    const valids: MutationTodoUpdateArgs[] = [
      { id },
      { id, title: "foo" },
      { id, description: "bar" },
      { id, status: TodoStatus.Done },
      { id, title: "foo", description: "bar", status: TodoStatus.Done },
      { id, title: "a".repeat(Todo.Title.MAX) },
      { id, description: "a".repeat(Todo.Description.MAX) },
    ];

    const invalids: [MutationTodoUpdateArgs, (keyof Omit<MutationTodoUpdateArgs, "id">)[]][] = [
      [{ id, title: null }, ["title"]],
      [{ id, description: null }, ["description"]],
      [{ id, status: null }, ["status"]],
      [{ id, title: "a".repeat(Todo.Title.MAX + 1) }, ["title"]],
      [{ id, description: "a".repeat(Todo.Description.MAX + 1) }, ["description"]],
      [{ id, title: null, description: null, status: null }, ["title", "description", "status"]],
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
