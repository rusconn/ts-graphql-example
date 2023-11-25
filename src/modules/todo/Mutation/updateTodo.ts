import * as Prisma from "@/prisma/mod.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { ParseError } from "../../common/parsers.ts";
import { full } from "../../common/resolvers.ts";
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
  const authed = authAuthenticated(context.user);

  const id = parseTodoNodeId(args.id);

  const { title, description, status } = args.input;

  if (title === null) {
    throw new ParseError('"title" must be not null');
  }
  if (description === null) {
    throw new ParseError('"description" must be not null');
  }
  if (status === null) {
    throw new ParseError('"status" must be not null');
  }
  if (title && [...title].length > TITLE_MAX) {
    throw new ParseError(`"title" must be up to ${TITLE_MAX} characters`);
  }
  if (description && [...description].length > DESC_MAX) {
    throw new ParseError(`"description" must be up to ${DESC_MAX} characters`);
  }

  try {
    const todo = await context.prisma.todo.update({
      where: { id, userId: authed.id },
      data: { title, description, status },
    });

    return {
      __typename: "UpdateTodoSuccess",
      todo: full(todo),
    };
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      context.logger.error(e, "error info");

      return {
        __typename: "TodoNotFoundError",
        message: "todo not found",
      };
    }

    throw e;
  }
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../../common/parsers.ts");
  const { TodoStatus } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");
  const { validTodoIds, invalidTodoIds } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: validTodoIds[0], input: {} },
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

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denys = [context.guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    describe("id", () => {
      const { input } = valid.args;

      test.each(validTodoIds)("valids %#", id => {
        void expect(resolve({ args: { id, input } })).resolves.not.toThrow(ParseErr);
      });

      test.each(invalidTodoIds)("invalids %#", id => {
        void expect(resolve({ args: { id, input } })).rejects.toThrow(ParseErr);
      });
    });

    describe("input", () => {
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
        { ...validInput, title: null },
        { ...validInput, description: null },
        { ...validInput, status: null },
        { ...validInput, title: "A".repeat(TITLE_MAX + 1) },
        { ...validInput, title: "🅰".repeat(TITLE_MAX + 1) },
        { ...validInput, description: "A".repeat(DESC_MAX + 1) },
        { ...validInput, description: "🅰".repeat(DESC_MAX + 1) },
      ] as Args["input"][];

      test.each(valids)("valids %#", input => {
        void expect(resolve({ args: { id, input } })).resolves.not.toThrow(ParseErr);
      });

      test.each(invalids)("invalids %#", input => {
        void expect(resolve({ args: { id, input } })).rejects.toThrow(ParseErr);
      });
    });
  });
}
