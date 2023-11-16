import type { UserResolvers } from "../common/schema.ts";
import { userNodeId } from "./common/adapter.ts";
import { isAdminOrUserOwner } from "./common/authorizer.ts";
import { fullUser } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return adapter(user.id);
};

const authorizer = isAdminOrUserOwner;

const adapter = userNodeId;

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");

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
