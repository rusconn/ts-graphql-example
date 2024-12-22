import type { MutationResolvers, MutationUpdateTodoArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { TODO_DESCRIPTION_MAX, parseTodoDescription } from "../parsers/description.ts";
import { parseTodoId } from "../parsers/id.ts";
import { parseTodoStatus } from "../parsers/status.ts";
import { TODO_TITLE_MAX, parseTodoTitle } from "../parsers/title.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    updateTodo(
      id: ID!

      """
      ${TODO_TITLE_MAX}文字まで、null は入力エラー
      """
      title: NonEmptyString

      """
      ${TODO_DESCRIPTION_MAX}文字まで、null は入力エラー
      """
      description: String

      """
      null は入力エラー
      """
      status: TodoStatus
    ): UpdateTodoResult
  }

  union UpdateTodoResult = UpdateTodoSuccess | InvalidInputError | ResourceNotFoundError

  type UpdateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["updateTodo"] = async (_parent, args, context) => {
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

  const todo = await context.db
    .updateTable("Todo")
    .where("id", "=", id)
    .where("userId", "=", authed.id)
    .set({
      updatedAt: new Date(),
      ...rest,
    })
    .returningAll()
    .executeTakeFirst();

  return todo
    ? {
        __typename: "UpdateTodoSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};

const parseArgs = (args: MutationUpdateTodoArgs) => {
  const id = parseTodoId(args);

  if (id instanceof Error) {
    return id;
  }

  const title = parseTodoTitle(args, {
    optional: true,
    nullable: false,
  });

  if (title instanceof Error) {
    return title;
  }

  const description = parseTodoDescription(args, {
    optional: true,
    nullable: false,
  });

  if (description instanceof Error) {
    return description;
  }

  const status = parseTodoStatus(args, {
    optional: true,
    nullable: false,
  });

  if (status instanceof Error) {
    return status;
  }

  return { id, title, description, status };
};

if (import.meta.vitest) {
  const { TodoStatus } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      {},
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(TODO_TITLE_MAX) },
      { description: "A".repeat(TODO_DESCRIPTION_MAX) },
    ] as Omit<MutationUpdateTodoArgs, "id">[];

    const invalids = [
      { title: null },
      { description: null },
      { status: null },
      { title: "A".repeat(TODO_TITLE_MAX + 1) },
      { description: "A".repeat(TODO_DESCRIPTION_MAX + 1) },
    ] as Omit<MutationUpdateTodoArgs, "id">[];

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
