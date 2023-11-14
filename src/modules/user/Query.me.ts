import { isAuthenticated } from "../common/authorizers.ts";
import { full } from "../common/resolvers.ts";
import type { QueryResolvers } from "../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = isAuthenticated(context.user);

  return full(authed);
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ user }: { user: Params["user"] }) => {
    return resolver({}, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [admin, alice];

    const denys = [guest];

    test.each(allows)("allows %#", user => {
      expect(() => resolve({ user })).not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      expect(() => resolve({ user })).toThrow(AuthErr);
    });
  });
}
