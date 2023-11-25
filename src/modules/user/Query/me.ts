import { authAuthenticated } from "../../common/authorizers.ts";
import { full } from "../../common/resolvers.ts";
import type { QueryResolvers } from "../../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = authAuthenticated(context.user);

  return full(authed);
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../common/test.ts");

  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ user }: { user: Params["user"] }) => {
    return resolver({}, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denys = [context.guest];

    test.each(allows)("allows %#", user => {
      expect(() => resolve({ user })).not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      expect(() => resolve({ user })).toThrow(AuthErr);
    });
  });
}
