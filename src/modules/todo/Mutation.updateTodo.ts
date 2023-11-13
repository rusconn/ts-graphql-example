import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import { ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationUpdateTodoArgs } from "../common/schema.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    updateTodo(id: ID!, input: UpdateTodoInput!): UpdateTodoResult
  }

  input UpdateTodoInput {
    "100文字まで、null は入力エラー"
    title: NonEmptyString
    "5000文字まで、null は入力エラー"
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
    throw new ParseError("`title` must be not null");
  }
  if (description === null) {
    throw new ParseError("`description` must be not null");
  }
  if (status === null) {
    throw new ParseError("`status` must be not null");
  }
  if (title && [...title].length > 100) {
    throw new ParseError("`title` must be up to 100 characters");
  }
  if (description && [...description].length > 5000) {
    throw new ParseError("`description` must be up to 5000 characters");
  }

  return { id: idToUse, title, description, status };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");
  const { TodoStatus } = await import("../common/schema.js");

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
      const titleMax = 100;
      const descMax = 5000;

      const id = validTodoIds[0];

      const valid = [
        { title: "title" },
        { description: "description" },
        { status: TodoStatus.Done },
        { title: "title", description: "description", status: TodoStatus.Done },
        { title: "A".repeat(titleMax) },
        { title: "🅰".repeat(titleMax) },
        { description: "A".repeat(descMax) },
        { description: "🅰".repeat(descMax) },
      ] as MutationUpdateTodoArgs["input"][];

      const invalid = [
        { title: null },
        { description: null },
        { status: null },
        { title: "A".repeat(titleMax + 1) },
        { title: "🅰".repeat(titleMax + 1) },
        { description: "A".repeat(descMax + 1) },
        { description: "🅰".repeat(descMax + 1) },
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
