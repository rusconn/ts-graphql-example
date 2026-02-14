import { Result } from "neverthrow";

import { Todo } from "../../domain/models.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoUpdateArgs } from "../_schema.ts";
import { invalidInputErrors } from "../_shared/errors.ts";

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
    throw forbiddenErr(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const updatedTodo = Todo.update(todo, parsed.value);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.update(updatedTodo);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "TodoUpdateSuccess",
    todo: updatedTodo,
  };
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
  const { TodoStatus } = await import("../_schema.ts");

  describe("Parsing", () => {
    const id = Todo.Id.create();

    const valids: MutationTodoUpdateArgs[] = [
      { id },
      { id, title: "title" },
      { id, description: "description" },
      { id, status: TodoStatus.Done },
      { id, title: "title", description: "description", status: TodoStatus.Done },
      { id, title: "A".repeat(Todo.Title.MAX) },
      { id, description: "A".repeat(Todo.Description.MAX) },
    ];

    const invalids: [MutationTodoUpdateArgs, (keyof Omit<MutationTodoUpdateArgs, "id">)[]][] = [
      [{ id, title: null }, ["title"]],
      [{ id, description: null }, ["description"]],
      [{ id, status: null }, ["status"]],
      [{ id, title: "A".repeat(Todo.Title.MAX + 1) }, ["title"]],
      [{ id, description: "A".repeat(Todo.Description.MAX + 1) }, ["description"]],
      [{ id, title: null, description: null, status: null }, ["title", "description", "status"]],
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
}
