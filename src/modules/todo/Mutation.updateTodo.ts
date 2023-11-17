import * as Prisma from "@/prisma/mod.ts";
import { isAuthenticated } from "../common/authorizers.ts";
import { ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers, MutationUpdateTodoArgs } from "../common/schema.ts";
import { parseTodoNodeId } from "./common/parser.ts";

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
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.update({
      where: { id: parsed.id, userId: authed.id },
      data: parsed,
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

const authorizer = isAuthenticated;

const parser = (args: MutationUpdateTodoArgs) => {
  const { id, input } = args;
  const { title, description, status } = input;

  const idToUse = parseTodoNodeId(id);

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

  return { id: idToUse, title, description, status };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { TodoStatus } = await import("../common/schema.ts");

  describe("Authorization", () => {
    const allow = [admin, alice];

    const deny = [guest];

    test.each(allow)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", user => {
      expect(() => authorizer(user)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    describe("id", () => {
      const input = {
        title: "title",
        description: "description",
        status: TodoStatus.Done,
      } as MutationUpdateTodoArgs["input"];

      test.each(validTodoIds)("valid %#", id => {
        expect(() => parser({ id, input })).not.toThrow(ParseErr);
      });

      test.each(invalidTodoIds)("invalid %#", id => {
        expect(() => parser({ id, input })).toThrow(ParseErr);
      });
    });

    describe("input", () => {
      const id = validTodoIds[0];

      const valid = [
        { title: "title" },
        { description: "description" },
        { status: TodoStatus.Done },
        { title: "title", description: "description", status: TodoStatus.Done },
        { title: "A".repeat(TITLE_MAX) },
        { title: "🅰".repeat(TITLE_MAX) },
        { description: "A".repeat(DESC_MAX) },
        { description: "🅰".repeat(DESC_MAX) },
      ] as MutationUpdateTodoArgs["input"][];

      const invalid = [
        { title: null },
        { description: null },
        { status: null },
        { title: "A".repeat(TITLE_MAX + 1) },
        { title: "🅰".repeat(TITLE_MAX + 1) },
        { description: "A".repeat(DESC_MAX + 1) },
        { description: "🅰".repeat(DESC_MAX + 1) },
      ] as MutationUpdateTodoArgs["input"][];

      test.each(valid)("valid %#", input => {
        expect(() => parser({ id, input })).not.toThrow(ParseErr);
      });

      test.each(invalid)("invalid %#", input => {
        expect(() => parser({ id, input })).toThrow(ParseErr);
      });
    });
  });
}
