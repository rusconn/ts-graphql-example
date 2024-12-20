import type { MutationResolvers, MutationUpdateTodoArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parseTodoNodeId } from "../common/parser.ts";

const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    updateTodo(
      id: ID!

      """
      ${TITLE_MAX}文字まで、null は入力エラー
      """
      title: NonEmptyString

      """
      ${DESC_MAX}文字まで、null は入力エラー
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
  const parsed = parseTodoNodeId(args.id);

  if (parsed instanceof Error) {
    return parsed;
  }

  const { title, description, status } = args;

  if (title === null) {
    return parseErr('"title" must be not null');
  }
  if (description === null) {
    return parseErr('"description" must be not null');
  }
  if (status === null) {
    return parseErr('"status" must be not null');
  }
  if (title && numChars(title) > TITLE_MAX) {
    return parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if (description && numChars(description) > DESC_MAX) {
    return parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { id: parsed, title, description, status };
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
      { title: "A".repeat(TITLE_MAX) },
      { description: "A".repeat(DESC_MAX) },
    ] as Omit<MutationUpdateTodoArgs, "id">[];

    const invalids = [
      { description: null },
      { status: null },
      { title: "A".repeat(TITLE_MAX + 1) },
      { description: "A".repeat(DESC_MAX + 1) },
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
