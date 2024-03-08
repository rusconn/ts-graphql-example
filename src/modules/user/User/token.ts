import type { UserResolvers } from "../../common/schema.ts";
import { authUserOwner } from "../common/authorizer.ts";
import { fullUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    token: NonEmptyString
  }
`;

export const resolver: UserResolvers["token"] = async (parent, _args, context) => {
  authUserOwner(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.token;
};

if (import.meta.vitest) {
  const { full } = await import("../../common/resolvers.ts");
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    const prisma = {
      user: { findUniqueOrThrow: async () => parent },
    } as unknown as Params["prisma"];

    return resolver(parent, {}, dummyContext({ prisma, user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.alice, db.alice],
    ] as const;

    const denies = [
      [context.admin, db.alice],
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", async (user, parent) => {
      await resolve({ parent: full(parent), user });
    });

    test.each(denies)("denies %#", async (user, parent) => {
      expect.assertions(1);
      try {
        await resolve({ parent: full(parent), user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
