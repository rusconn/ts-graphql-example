import type { Context } from "../../../context.ts";
import type { ResolversParentTypes } from "../../../schema.ts";
import { authAdmin } from "../admin.ts";
import { authErr } from "../util.ts";

type ParentUser = Pick<ResolversParentTypes["User"], "id">;

export const authAdminOrUserOwner = (context: Context, user: ParentUser) => {
  const ctx = authAdmin(context);

  if (Error.isError(ctx)) {
    return authUserOwner(context, user);
  }

  return ctx;
};

const authUserOwner = (context: Context, user: ParentUser) => {
  if (context.role === "guest" || context.user.id !== user.id) {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  describe("authAdminOrUserOwner", () => {
    const allows = [
      [context.admin, domain.users.admin],
      [context.admin, domain.users.alice],
      [context.alice, domain.users.alice],
    ] as const;

    const denies = [
      [context.alice, domain.users.admin],
      [context.guest, domain.users.admin],
      [context.guest, domain.users.alice],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      const authed = authAdminOrUserOwner(context as Context, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (context, user) => {
      const authed = authAdminOrUserOwner(context as Context, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });

  describe("authUserOwner", () => {
    const allows = [
      [context.admin, domain.users.admin],
      [context.alice, domain.users.alice],
    ] as const;

    const denies = [
      [context.admin, domain.users.alice],
      [context.alice, domain.users.admin],
      [context.guest, domain.users.admin],
      [context.guest, domain.users.alice],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      const authed = authUserOwner(context as Context, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (context, user) => {
      const authed = authUserOwner(context as Context, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });
}
