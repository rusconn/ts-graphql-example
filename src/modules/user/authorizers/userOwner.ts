import type { ResolversParentTypes } from "../../../schema.ts";
import type { AuthContext } from "../../common/authorizers/types.ts";
import { authErr } from "../../common/authorizers/util.ts";

type ParentUser = Pick<ResolversParentTypes["User"], "id">;

export const authUserOwner = (context: AuthContext, user: ParentUser) => {
  if (context.user?.id !== user.id) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { db } = await import("../../common/testData/db.ts");
  const { context } = await import("../../common/testData/context.ts");

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
}
