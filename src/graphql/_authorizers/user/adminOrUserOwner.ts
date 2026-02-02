import type { ResolversParentTypes } from "../../../schema.ts";
import { authAdmin } from "../admin.ts";
import type { AuthContext } from "../types.ts";
import { authErr } from "../util.ts";

type ParentUser = Pick<ResolversParentTypes["User"], "id">;

export const authAdminOrUserOwner = (ctx: AuthContext, user: ParentUser) => {
  const authed = authAdmin(ctx);

  if (Error.isError(authed)) {
    return authUserOwner(ctx, user);
  }

  return authed;
};

const authUserOwner = (ctx: AuthContext, user: ParentUser) => {
  if (ctx.user?.id !== user.id) {
    return authErr();
  }

  return ctx.user;
};

if (import.meta.vitest) {
  const { ctx } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  describe("authAdminOrUserOwner", () => {
    const allows = [
      [ctx.user.admin, domain.users.admin],
      [ctx.user.admin, domain.users.alice],
      [ctx.user.alice, domain.users.alice],
    ] as const;

    const denies = [
      [ctx.user.alice, domain.users.admin],
      [ctx.user.guest, domain.users.admin],
      [ctx.user.guest, domain.users.alice],
    ] as const;

    test.each(allows)("allows %#", (contextUser, user) => {
      const authed = authAdminOrUserOwner({ user: contextUser }, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      const authed = authAdminOrUserOwner({ user: contextUser }, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });

  describe("authUserOwner", () => {
    const allows = [
      [ctx.user.admin, domain.users.admin],
      [ctx.user.alice, domain.users.alice],
    ] as const;

    const denies = [
      [ctx.user.admin, domain.users.alice],
      [ctx.user.alice, domain.users.admin],
      [ctx.user.guest, domain.users.admin],
      [ctx.user.guest, domain.users.alice],
    ] as const;

    test.each(allows)("allows %#", (contextUser, user) => {
      const authed = authUserOwner({ user: contextUser }, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (contextUser, user) => {
      const authed = authUserOwner({ user: contextUser }, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });
}
