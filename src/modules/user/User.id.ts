import type { UserResolvers } from "../common/schema.ts";
import { userNodeId } from "./common/adapter.ts";
import { authAdminOrUserOwner } from "./common/authorizer.ts";
import { fullUser } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return userNodeId(user.id);
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { full } = await import("../common/resolvers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    return resolver(parent, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const denys = [
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).rejects.toThrow(AuthErr);
    });
  });
}
