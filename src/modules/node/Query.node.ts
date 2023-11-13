import { isAuthenticated } from "../common/authorizers.js";
import { parseNodeId } from "../common/parsers.js";
import type { QueryResolvers, QueryNodeArgs } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = (_parent, args, context) => {
  authorizer(context.user);

  const { type, id } = parser(args);

  return { type, id };
};

const authorizer = isAuthenticated;

const parser = (args: QueryNodeArgs) => {
  return parseNodeId(args.id);
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { validNodeIds, invalidIds } = await import("tests/data/graph.js");
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
    test.each(validNodeIds)("valid %#", id => {
      expect(() => parser({ id })).not.toThrow(ParseErr);
    });

    test.each(invalidIds)("invalid %#", id => {
      expect(() => parser({ id })).toThrow(ParseErr);
    });
  });
}
