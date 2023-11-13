import * as Prisma from "@/prisma/mod.js";
import { isAuthenticated } from "../common/authorizers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers, MutationUncompleteTodoArgs } from "../common/schema.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    uncompleteTodo(id: ID!): UncompleteTodoResult
  }

  union UncompleteTodoResult = UncompleteTodoSuccess | TodoNotFoundError

  type UncompleteTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["uncompleteTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  try {
    const todo = await context.prisma.todo.update({
      where: { id: parsed.id, userId: authed.id },
      data: parsed,
    });

    return {
      __typename: "UncompleteTodoSuccess",
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

const parser = (args: MutationUncompleteTodoArgs) => {
  return { id: parseTodoNodeId(args.id), status: Prisma.TodoStatus.PENDING };
};

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
