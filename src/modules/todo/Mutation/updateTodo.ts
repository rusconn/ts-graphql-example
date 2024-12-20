import type { MutationResolvers, MutationUpdateTodoArgs } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
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

  union UpdateTodoResult = UpdateTodoSuccess | InvalidInputError | ResourceNotFoundError

  type UpdateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["updateTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs(args);
  } catch (e) {
    if (e instanceof Error) {
      return {
        __typename: "InvalidInputError",
        message: e.message,
      };
    }
    throw e;
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
  if (title && numChars(title) > TITLE_MAX) {
    throw parseErr(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if (description && numChars(description) > DESC_MAX) {
    throw parseErr(`"description" must be up to ${DESC_MAX} characters`);
  }

  return { id, title, description, status };
};

if (import.meta.vitest) {
  const { ErrorCode, TodoStatus } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      {},
      { title: "title" },
      { description: "description" },
      { status: TodoStatus.Done },
      { title: "title", description: "description", status: TodoStatus.Done },
      { title: "A".repeat(TITLE_MAX) },
      { description: "A".repeat(DESC_MAX) },
    ] as MutationUpdateTodoArgs["input"][];

    const invalids = [
      { description: null },
      { status: null },
      { title: "A".repeat(TITLE_MAX + 1) },
      { description: "A".repeat(DESC_MAX + 1) },
    ] as MutationUpdateTodoArgs["input"][];

    const id = "Todo:0193cb3e-5fdd-7264-9f70-1df63d84b251";

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
