import type { MutationResolvers, MutationTodoUpdateArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoDescription, TODO_DESCRIPTION_MAX } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { parseTodoTitle, TODO_TITLE_MAX } from "../_parsers/todo/title.ts";
import { invalidInputErrors, ParseErr } from "../_parsers/util.ts";

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

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const todo = await ctx.repos.todo.find(id);
  if (!todo || todo.userId !== ctx.user.id) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const updatedTodo: typeof todo = {
    ...todo,
    ...parsed,
    updatedAt: new Date(),
  };

  const success = await ctx.repos.todo.save(updatedTodo);
  if (!success) {
    throw internalServerError();
  }

  const found = await ctx.queries.todo.find(todo.id);
  if (!found) {
    throw internalServerError();
  }

  return {
    __typename: "TodoUpdateSuccess",
    todo: found,
  };
};

const parseArgs = (args: Omit<MutationTodoUpdateArgs, "id">) => {
  const title = parseTodoTitle(args, "title", {
    optional: true,
    nullable: false,
  });
  const description = parseTodoDescription(args, "description", {
    optional: true,
    nullable: false,
  });
  const status = parseTodoStatus(args, "status", {
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
    return {
      ...(title != null && {
        title,
      }),
      ...(description != null && {
        description,
      }),
      ...(status != null && {
        status,
      }),
    };
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
