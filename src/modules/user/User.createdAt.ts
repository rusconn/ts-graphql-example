import type { UserResolvers } from "../common/schema.js";
import { isAdminOrUserOwner } from "./common/authorizer.js";
import { fullUser } from "./common/resolver.js";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.createdAt;
};

const authorizer = isAdminOrUserOwner;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");

  describe("Authorization", () => {
    const allow = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const deny = [
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
