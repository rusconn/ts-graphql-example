import { isAdmin } from "../common/authorizers.js";
import type { QueryResolvers, QueryUserArgs } from "../common/schema.js";
import { parseUserNodeId } from "./common/parser.js";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = (_parent, args, context) => {
  authorizer(context.user);

  const { id } = parser(args);

  return { id };
};

const authorizer = isAdmin;

const parser = (args: QueryUserArgs) => {
  return { id: parseUserNodeId(args.id) };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { validUserIds, invalidUserIds } = await import("tests/data/graph.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allow = [admin];

    const deny = [alice, guest];

    test.each(allow)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", user => {
      expect(() => authorizer(user)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validUserIds)("valid %#", id => {
      expect(() => parser({ id })).not.toThrow(ParseErr);
    });

    test.each(invalidUserIds)("invalid %#", id => {
      expect(() => parser({ id })).toThrow(ParseErr);
    });
  });
}
