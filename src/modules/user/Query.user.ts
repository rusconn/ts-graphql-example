import { isAdmin } from "../common/authorizers.ts";
import { key } from "../common/resolvers.ts";
import type { QueryResolvers, QueryUserArgs } from "../common/schema.ts";
import { parseUserNodeId } from "./common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = (_parent, args, context) => {
  authorizer(context.user);

  const { id } = parser(args);

  return key({ id });
};

const authorizer = isAdmin;

const parser = (args: QueryUserArgs) => {
  return { id: parseUserNodeId(args.id) };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { validUserIds, invalidUserIds } = await import("tests/data/graph.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

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
