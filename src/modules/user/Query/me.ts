import { auth } from "../../common/authorizers.ts";
import type { QueryResolvers } from "../../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = auth(context);

  return authed;
};

if (import.meta.vitest) {
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../common/test.ts");

  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ user }: { user: Params["user"] }) => {
    return resolver({}, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice, context.guest];

    test.each(allows)("allows %#", (user) => {
      resolve({ user });
    });
  });
}
