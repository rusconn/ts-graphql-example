import { isAuthenticated } from "../common/authorizers.js";
import { full } from "../common/resolvers.js";
import type { QueryResolvers } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = authorizer(context.user);

  return full(authed);
};

const authorizer = isAuthenticated;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");

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
}
