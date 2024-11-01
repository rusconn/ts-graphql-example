import type { MutationResolvers, MutationUpdateTodoArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import { parseTodoNodeId } from "../common/parser.ts";

const TITLE_MAX = 100;
const DESC_MAX = 5000;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoResult
  }

  input UpdateTodoInput {
    "${TITLE_MAX}文字まで、null は入力エラー"
    title: NonEmptyString
    "${DESC_MAX}文字まで、null は入力エラー"
    description: String
    "null は入力エラー"
    status: TodoStatus
  }

  union UpdateTodoResult = UpdateTodoSuccess | TodoNotFoundError

  type UpdateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["updateTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const { id, title, description, status } = parseArgs(args);

  const todo = await context.db
    .updateTable("Todo")
    .where("id", "=", id)
    .where("userId", "=", authed.id)
    .set({ title, description, status })
    .returningAll()
    .executeTakeFirst();

  return todo
    ? {
        __typename: "UpdateTodoSuccess",
        todo,
      }
    : {
        __typename: "TodoNotFoundError",
        message: "todo not found",
      };
};

const parseArgs = (args: MutationUpdateTodoArgs) => {
  const id = parseTodoNodeId(args.id);

  const { title, description, status } = args.input;

  if (title === null) {
    throw parseErr('"title" must be not null');
  }
  if (description === null) {
    throw parseErr('"description" must be not null');
  }
  if (status === null) {
    throw parseErr('"status" must be not null');
  }
  if (title && [...title].length > TITLE_MAX) {
    throw parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if (description && [...description].length > DESC_MAX) {
    throw parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { id, title, description, status };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");
  const { TodoStatus } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      {},
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(TITLE_MAX) },
      { title: "🅰".repeat(TITLE_MAX) },
      { description: "A".repeat(DESC_MAX) },
      { description: "🅰".repeat(DESC_MAX) },
    ] as MutationUpdateTodoArgs["input"][];

    const invalids = [
      { description: null },
      { status: null },
      { title: "A".repeat(TITLE_MAX + 1) },
      { title: "🅰".repeat(TITLE_MAX + 1) },
      { description: "A".repeat(DESC_MAX + 1) },
      { description: "🅰".repeat(DESC_MAX + 1) },
    ] as MutationUpdateTodoArgs["input"][];

    const id = "Todo:01H75CR8C6PQK7Z7RE4FBY1B4M";

    test.each(valids)("valids %#", (input) => {
      parseArgs({ id, input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ id, input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
