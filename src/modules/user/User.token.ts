import type { UserResolvers } from "../common/schema.ts";
import { authUserOwner } from "./common/authorizer.ts";
import { fullUser } from "./common/resolver.ts";

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
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { key } = await import("../common/resolvers.ts");
  const { dummyContext } = await import("../common/tests.ts");

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
      [admin, admin],
      [alice, alice],
      [guest, guest],
    ] as const;

    const denys = [
      [admin, alice],
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: key(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      void expect(resolve({ parent: key(parent), user })).rejects.toThrow(AuthErr);
    });
  });
}
