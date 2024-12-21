import { type AuthContext, authErr } from "../../common/authorizers.ts";
import type { User } from "./resolver.ts";

type AuthUser = Pick<User, "id">;

export const authUserOwner = (context: AuthContext, user: AuthUser) => {
  if (context.user?.id !== user.id) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { db } = await import("../../common/testData/db.ts");
  const { context } = await import("../../common/testData/context.ts");

  describe("authUserOwner", () => {
    const allows = [
      [context.alice, db.alice],
      [context.bob, db.bob],
    ] as const;

    const denies = [
      [context.alice, db.bob],
      [context.bob, db.alice],
      [context.guest, db.alice],
      [context.guest, db.bob],
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
