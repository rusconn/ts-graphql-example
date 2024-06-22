import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import type { MutationResolvers } from "../../common/schema.ts";
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

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { TodoStatus } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../common/testData/mod.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: "Todo:01H75CR8C6PQK7Z7RE4FBY1B4M", input: {} },
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Parsing", () => {
    const { id, input: validInput } = valid.args;

    const valids = [
      { ...validInput },
      { ...validInput, title: "title" },
      { ...validInput, description: "description" },
      { ...validInput, status: TodoStatus.Done },
      { ...validInput, title: "title", description: "description", status: TodoStatus.Done },
      { ...validInput, title: "A".repeat(TITLE_MAX) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX) },
      { ...validInput, description: "A".repeat(DESC_MAX) },
      { ...validInput, description: "🅰".repeat(DESC_MAX) },
    ] as Args["input"][];

    const invalids = [
      { ...validInput, description: null },
      { ...validInput, status: null },
      { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
      { ...validInput, title: "🅰".repeat(TITLE_MAX + 1) },
      { ...validInput, description: "A".repeat(DESC_MAX + 1) },
      { ...validInput, description: "🅰".repeat(DESC_MAX + 1) },
    ] as Args["input"][];

    test.each(valids)("valids %#", async (input) => {
      await resolve({ args: { id, input } });
    });

    test.each(invalids)("invalids %#", async (input) => {
      expect.assertions(1);
      try {
        await resolve({ args: { id, input } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
