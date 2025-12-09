import type { ResolversParentTypes } from "../../../schema.ts";
import { authAdmin } from "../admin.ts";
import type { AuthContext } from "../types.ts";
import { authErr } from "../util.ts";

type ParentUser = Pick<ResolversParentTypes["User"], "id">;

export const authAdminOrUserOwner = (context: AuthContext, user: ParentUser) => {
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    return authUserOwner(context, user);
  }

  return authed;
};

const authUserOwner = (context: AuthContext, user: ParentUser) => {
  if (context.user?.id !== user.id) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { db } = await import("../../_testData/db.ts");
  const { context } = await import("../../_testData/context.ts");

  describe("authAdminOrUserOwner", () => {
    const allows = [
      [context.user.admin, db.users.admin],
      [context.user.admin, db.users.alice],
      [context.user.alice, db.users.alice],
    ] as const;

    const denies = [
      [context.user.alice, db.users.admin],
      [context.user.guest, db.users.admin],
      [context.user.guest, db.users.alice],
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
      [context.user.admin, db.users.admin],
      [context.user.alice, db.users.alice],
    ] as const;

    const denies = [
      [context.user.admin, db.users.alice],
      [context.user.alice, db.users.admin],
      [context.user.guest, db.users.admin],
      [context.user.guest, db.users.alice],
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
