import type { MutationResolvers, MutationTodoUpdateArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../_parsers/todo/title.ts";

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

  union TodoUpdateResult = TodoUpdateSuccess | InvalidInputError | ResourceNotFoundError

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

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const { id, ...rest } = parsed;

  const todo = await context.api.todo.update(
    { id: id, userId: authed.id }, //
    rest,
  );

  return todo
    ? {
        __typename: "TodoUpdateSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};

const parseArgs = (args: MutationTodoUpdateArgs) => {
  const id = parseTodoId(args);

  if (id instanceof Error) {
    return id;
  }

  const title = parseTodoTitle(args.title, "title", {
    optional: true,
    nullable: false,
  });

  if (title instanceof Error) {
    return title;
  }

  const description = parseTodoDescription(args.description, "description", {
    optional: true,
    nullable: false,
  });

  if (description instanceof Error) {
    return description;
  }

  const status = parseTodoStatus(args.status, "status", {
    optional: true,
    nullable: false,
  });

  if (status instanceof Error) {
    return status;
  }

  return { id, title, description, status };
};

if (import.meta.vitest) {
  const { TodoStatus } = await import("../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      {},
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(TODO_TITLE_MAX) },
      { description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ] as Omit<MutationTodoUpdateArgs, "id">[];

    const invalids = [
      { title: null },
      { description: null },
      { status: null },
      { title: "A".repeat(TODO_TITLE_MAX + 1) },
      { description: "A".repeat(TODO_DESCRIPTION_MAX + 1) },
    ] as Omit<MutationTodoUpdateArgs, "id">[];

    const id = "Todo:0193cb3e-5fdd-7264-9f70-1df63d84b251";

    test.each(valids)("valids %#", (rest) => {
      const parsed = parseArgs({ id, ...rest });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (rest) => {
      const parsed = parseArgs({ id, ...rest });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
