import type { UserResolvers } from "../../common/schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context.user, parent);

  const user = await getUser(context.prisma, parent);

  return user.createdAt;
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    const prisma = {
      user: { findUnique: async () => parent },
    } as unknown as Params["prisma"];

    return resolver(parent, {}, dummyContext({ prisma, user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denies = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", async (user, parent) => {
      await resolve({ parent, user });
    });

    test.each(denies)("denies %#", async (user, parent) => {
      expect.assertions(1);
      try {
        await resolve({ parent, user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
