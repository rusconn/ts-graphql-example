import type { UserResolvers } from "../common/schema.ts";
import { isUserOwner } from "./common/authorizer.ts";
import { fullUser } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    token: NonEmptyString
  }
`;

export const resolver: UserResolvers["token"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.token;
};

const authorizer = isUserOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");

  describe("Authorization", () => {
    const allow = [
      [admin, admin],
      [alice, alice],
      [guest, guest],
    ] as const;

    const deny = [
      [admin, alice],
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allow)("allow %#", (user, parent) => {
      expect(() => authorizer(user, parent)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", (user, parent) => {
      expect(() => authorizer(user, parent)).toThrow(AuthErr);
    });
  });
}
