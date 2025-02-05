import type { MutationResolvers, MutationTodoUpdateArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../_parsers/todo/title.ts";
import { ParseErr } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoUpdate(
      id: ID!

      """
      ${TODO_TITLE_MAX}文字まで、null は入力エラー
      """
      title: String

      """
      ${TODO_DESCRIPTION_MAX}文字まで、null は入力エラー
      """
      description: String

      """
      null は入力エラー
      """
      status: TodoStatus
    ): TodoUpdateResult
  }

  union TodoUpdateResult = TodoUpdateSuccess | InvalidInputErrors | ResourceNotFoundError

  type TodoUpdateSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoUpdate"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return {
      __typename: "InvalidInputErrors",
      errors: parsed.map((e) => ({
        field: e.field,
        message: e.message,
      })),
    };
  }

  const { id, ...rest } = parsed;

  const todo = await context.api.todo.update(
    { id, userId: authed.id }, //
    rest,
  );

  return todo
    ? {
        __typename: "TodoUpdateSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
};

const parseArgs = (args: MutationTodoUpdateArgs) => {
  const id = parseTodoId(args);

  const title = parseTodoTitle(args.title, "title", {
    optional: true,
    nullable: false,
  });
  const description = parseTodoDescription(args.description, "description", {
    optional: true,
    nullable: false,
  });
  const status = parseTodoStatus(args.status, "status", {
    optional: true,
    nullable: false,
  });

  if (
    id instanceof Error ||
    title instanceof ParseErr ||
    description instanceof ParseErr ||
    status instanceof ParseErr
  ) {
    const errors = [];

    if (id instanceof Error) {
      errors.push(new ParseErr("id", id.message, { cause: id }));
    }
    if (title instanceof ParseErr) {
      errors.push(title);
    }
    if (description instanceof ParseErr) {
      errors.push(description);
    }
    if (status instanceof ParseErr) {
      errors.push(status);
    }

    return errors;
  } else {
    return { id, title, description, status };
  }
};

if (import.meta.vitest) {
  const TodoId = await import("../../db/models/todo/id.ts");
  const { TodoStatus } = await import("../../schema.ts");
  const { todoId } = await import("../_adapters/todo/id.ts");

  describe("Parsing", () => {
    const id = todoId(TodoId.gen());
    const invalidId = id.slice(0, -1);

    const valids: MutationTodoUpdateArgs[] = [
      { id },
      { id, title: "title" },
      { id, description: "description" },
      { id, status: TodoStatus.Done },
      { id, title: "title", description: "description", status: TodoStatus.Done },
      { id, title: "A".repeat(TODO_TITLE_MAX) },
      { id, description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ];

    const invalids: [MutationTodoUpdateArgs, (keyof MutationTodoUpdateArgs)[]][] = [
      [{ id: invalidId }, ["id"]],
      [{ id, title: null }, ["title"]],
      [{ id, description: null }, ["description"]],
      [{ id, status: null }, ["status"]],
      [{ id, title: "A".repeat(TODO_TITLE_MAX + 1) }, ["title"]],
      [{ id, description: "A".repeat(TODO_DESCRIPTION_MAX + 1) }, ["description"]],
      [
        { id: invalidId, title: null, description: null, status: null },
        ["id", "title", "description", "status"],
      ],
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
}
