import { type AuthContext, authAdmin, authErr } from "../../common/authorizers.ts";
import type { User } from "./resolver.ts";

export const authAdminOrUserOwner = (context: AuthContext, user: Pick<User, "id">) => {
  try {
    return authAdmin(context);
  } catch {
    return authUserOwner(context, user);
  }
};

export const authUserOwner = (context: AuthContext, user: Pick<User, "id">) => {
  if (context.user?.id === user.id) return context.user;
  throw authErr();
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
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
      authAdminOrUserOwner({ user: contextUser }, user);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      expect.assertions(1);
      try {
        authAdminOrUserOwner({ user: contextUser }, user);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
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
      authUserOwner({ user: contextUser }, user);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      expect.assertions(1);
      try {
        authUserOwner({ user: contextUser }, user);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
