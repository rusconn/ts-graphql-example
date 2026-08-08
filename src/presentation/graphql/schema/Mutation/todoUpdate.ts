import { Result } from "neverthrow";

import { updateTodo } from "../../../../application/usecases/update-todo.ts";
import { Todo } from "../../../../domain/entities.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoUpdateArgs } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ログイン済のみ
    """
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
    ): TodoUpdateResult @semanticNonNull @complexity(value: 50)
  }

  union TodoUpdateResult = TodoUpdateSuccess | InvalidInputErrors | ResourceNotFoundError

  type TodoUpdateSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoUpdate"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

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

function parseArgs(args: MutationTodoUpdateArgs) {
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
}

if (import.meta.vitest) {
  const { TodoStatus } = await import("../_types.ts");
  const { testParseArgs } = await import("../_test/helpers.ts");

  const id = Todo.Id.create();

  testParseArgs(parseArgs, {
    valids: [
      { id },
      { id, title: "foo" },
      { id, description: "bar" },
      { id, status: TodoStatus.Done },
      { id, title: "foo", description: "bar", status: TodoStatus.Done },
      { id, title: "a".repeat(Todo.Title.MAX) },
      { id, description: "a".repeat(Todo.Description.MAX) },
    ],
    invalids: [
      [{ id, title: null }, ["title"]],
      [{ id, description: null }, ["description"]],
      [{ id, status: null }, ["status"]],
      [{ id, title: "a".repeat(Todo.Title.MAX + 1) }, ["title"]],
      [{ id, description: "a".repeat(Todo.Description.MAX + 1) }, ["description"]],
      [{ id, title: null, description: null, status: null }, ["title", "description", "status"]],
    ],
  });
}
