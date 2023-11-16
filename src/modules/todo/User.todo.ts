import { key } from "../common/resolvers.js";
import type { UserResolvers } from "../common/schema.js";
import { isAdminOrUserOwner } from "./common/authorizer.js";
import { parseTodoNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = (parent, args, context) => {
  authorizer(context.user, parent);

  const id = parser(args.id);

  return key({ id, userId: parent.id });
};

const authorizer = isAdminOrUserOwner;

const parser = parseTodoNodeId;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allow = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const deny = [
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allow)("allow %#", (user, parent) => {
      expect(() => authorizer(user, parent)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", (user, parent) => {
      expect(() => authorizer(user, parent)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validTodoIds)("valid %#", id => {
      expect(() => parser(id)).not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalid %#", id => {
      expect(() => parser(id)).toThrow(ParseErr);
    });
  });
}
