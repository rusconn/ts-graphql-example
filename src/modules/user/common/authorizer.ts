import { type AuthContext, authErr } from "../../common/authorizers.ts";
import type { User } from "./resolver.ts";

type AuthUser = Pick<User, "id">;

export const authUserOwner = (context: AuthContext, user: AuthUser) => {
  if (context.user?.id === user.id) return context.user;
  throw authErr();
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");
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
