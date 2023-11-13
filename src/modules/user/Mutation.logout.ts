import { isAuthenticated } from "../common/authorizers.js";
import { full } from "../common/resolvers.js";
import type { MutationResolvers } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const authed = authorizer(context.user);

  const updated = await context.prisma.user.update({
    where: { id: authed.id },
    data: { token: null },
  });

  return {
    __typename: "LogoutSuccess",
    user: full(updated),
  };
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
