import type { UserResolvers } from "../../common/schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { fullUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.email;
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { full } = await import("../../common/resolvers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    return resolver(parent, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denys = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).rejects.toThrow(AuthErr);
    });
  });
}
