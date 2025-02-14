import { pickDefined } from "../../lib/object/pickDefined.ts";
import type { MutationResolvers, MutationTodoUpdateArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../_parsers/todo/title.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

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
    ): TodoUpdateResult @semanticNonNull
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

  const id = parseTodoId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const todo = await context.api.todo.update(
    { id, userId: authed.id }, //
    parsed,
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

const parseArgs = (args: Omit<MutationTodoUpdateArgs, "id">) => {
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
    title instanceof ParseErr || //
    description instanceof ParseErr ||
    status instanceof ParseErr
  ) {
    const errors = [];

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
    return pickDefined({ title, description, status });
  }
};

if (import.meta.vitest) {
  const { TodoStatus } = await import("../../schema.ts");

  describe("Parsing", () => {
    const valids: Omit<MutationTodoUpdateArgs, "id">[] = [
      {},
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(TODO_TITLE_MAX) },
      { description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ];

    const invalids: [
      Omit<MutationTodoUpdateArgs, "id">,
      (keyof Omit<MutationTodoUpdateArgs, "id">)[],
    ][] = [
      [{ title: null }, ["title"]],
      [{ description: null }, ["description"]],
      [{ status: null }, ["status"]],
      [{ title: "A".repeat(TODO_TITLE_MAX + 1) }, ["title"]],
      [{ description: "A".repeat(TODO_DESCRIPTION_MAX + 1) }, ["description"]],
      [{ title: null, description: null, status: null }, ["title", "description", "status"]],
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
