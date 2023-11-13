import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import type { MutationResolvers, MutationDeleteTodoArgs } from "../common/schema.js";
import { todoNodeId } from "./common/adapter.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deleteTodo(id: ID!): DeleteTodoResult
  }

  union DeleteTodoResult = DeleteTodoSuccess | TodoNotFoundError

  type DeleteTodoSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.delete({
      where: { id: parsed.id, userId: authed.id },
      select: { id: true },
    });

    return {
      __typename: "DeleteTodoSuccess",
      id: adapter(todo.id),
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

const parser = (args: MutationDeleteTodoArgs) => {
  return { id: parseTodoNodeId(args.id) };
};

const adapter = todoNodeId;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

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
    test.each(validTodoIds)("valid %#", id => {
      expect(() => parser({ id })).not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalid %#", id => {
      expect(() => parser({ id })).toThrow(ParseErr);
    });
  });
}
