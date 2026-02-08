import { Todo } from "../../domain.ts";
import { type MutationResolvers, type MutationTodoUpdateArgs, TodoStatus } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { todoStatusMap } from "../_parsers/todo/status.ts";
import { invalidInputErrors, parseArgNullability, ParseErr } from "../_parsers/util.ts";

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

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const parsed = parseArgs(args);
  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const updatedTodo = Todo.update(todo, parsed);
  const result = await ctx.repos.todo.update(updatedTodo);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
      throw internalServerError();
    default:
      throw new Error(result satisfies never);
  }

  const updated = await ctx.queries.todo.find(todo.id);
  if (!updated) {
    throw internalServerError();
  }

  return {
    __typename: "TodoUpdateSuccess",
    todo: updated,
  };
};

const parseArgs = (args: MutationTodoUpdateArgs) => {
  const title = parseTitle(args);
  const description = parseDescription(args);
  const status = parseStatus(args);

  if (
    Array.isArray(title) || //
    Array.isArray(description) ||
    Array.isArray(status)
  ) {
    const errors: ParseErr[] = [];

    if (Array.isArray(title)) {
      errors.push(...title);
    }
    if (Array.isArray(description)) {
      errors.push(...description);
    }
    if (Array.isArray(status)) {
      errors.push(...status);
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

const parseTitle = (args: MutationTodoUpdateArgs) => {
  const result1 = parseArgNullability(args, "title", {
    optional: true,
    nullable: false,
  });
  if (result1 instanceof ParseErr) {
    return [result1];
  }
  if (result1 == null) {
    return;
  }

  const result2 = Todo.Title.parse(result1);

  return Array.isArray(result2)
    ? result2.map((e) => new ParseErr("title", e)) //
    : result2;
};

const parseDescription = (args: MutationTodoUpdateArgs) => {
  const result1 = parseArgNullability(args, "description", {
    optional: true,
    nullable: false,
  });
  if (result1 instanceof ParseErr) {
    return [result1];
  }
  if (result1 == null) {
    return;
  }

  const result2 = Todo.Description.parse(result1);

  return Array.isArray(result2)
    ? result2.map((e) => new ParseErr("description", e)) //
    : result2;
};

const parseStatus = (args: MutationTodoUpdateArgs) => {
  const result1 = parseArgNullability(args, "status", {
    optional: true,
    nullable: false,
  });
  if (result1 instanceof ParseErr) {
    return [result1];
  }
  if (result1 == null) {
    return;
  }

  return todoStatusMap[result1 as TodoStatus];
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
      { title: "A".repeat(Todo.Title.MAX) },
      { description: "A".repeat(Todo.Description.MAX) },
    ];

    const invalids: [
      Omit<MutationTodoUpdateArgs, "id">,
      (keyof Omit<MutationTodoUpdateArgs, "id">)[],
    ][] = [
      [{ title: null }, ["title"]],
      [{ description: null }, ["description"]],
      [{ status: null }, ["status"]],
      [{ title: "A".repeat(Todo.Title.MAX + 1) }, ["title"]],
      [{ description: "A".repeat(Todo.Description.MAX + 1) }, ["description"]],
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
