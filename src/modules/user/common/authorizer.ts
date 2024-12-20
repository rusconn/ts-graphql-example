import { type AuthContext, authAdmin, authErr } from "../../common/authorizers.ts";
import type { User } from "./resolver.ts";

type AuthUser = Pick<User, "id">;

export const authAdminOrUserOwner = (context: AuthContext, user: AuthUser) => {
  const authed = authAdmin(context);

  return authed instanceof Error //
    ? authUserOwner(context, user)
    : authed;
};

const authUserOwner = (context: AuthContext, user: AuthUser) => {
  return context.user?.id === user.id //
    ? context.user
    : authErr();
};

if (import.meta.vitest) {
  const { db } = await import("../../common/testData/db.ts");
  const { context } = await import("../../common/testData/context.ts");

  describe("authAdminOrUserOwner", () => {
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

    test.each(allows)("allows %#", (contextUser, user) => {
      const authed = authAdminOrUserOwner({ user: contextUser }, user);
      expect(authed instanceof Error).toBe(false);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      const authed = authAdminOrUserOwner({ user: contextUser }, user);
      expect(authed instanceof Error).toBe(true);
    });
  });

  describe("authUserOwner", () => {
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

    test.each(allows)("allows %#", (contextUser, user) => {
      const authed = authUserOwner({ user: contextUser }, user);
      expect(authed instanceof Error).toBe(false);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      const authed = authUserOwner({ user: contextUser }, user);
      expect(authed instanceof Error).toBe(true);
    });
  });
}
