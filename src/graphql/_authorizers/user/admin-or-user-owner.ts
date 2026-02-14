import type { Context } from "../../../server/context.ts";
import type { ResolversParentTypes } from "../../_schema.ts";
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
  if (context.role === "GUEST" || context.user.id !== user.id) {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../../_test-data/context.ts");
  const { dto } = await import("../../_test-data/dto.ts");

  describe("authAdminOrUserOwner", () => {
    const allows = [
      [context.admin, dto.users.admin],
      [context.admin, dto.users.alice],
      [context.alice, dto.users.alice],
    ] as const;

    const denies = [
      [context.alice, dto.users.admin],
      [context.guest, dto.users.admin],
      [context.guest, dto.users.alice],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      const authed = authAdminOrUserOwner(context as unknown as Context, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (context, user) => {
      const authed = authAdminOrUserOwner(context as unknown as Context, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });

  describe("authUserOwner", () => {
    const allows = [
      [context.admin, dto.users.admin],
      [context.alice, dto.users.alice],
    ] as const;

    const denies = [
      [context.admin, dto.users.alice],
      [context.alice, dto.users.admin],
      [context.guest, dto.users.admin],
      [context.guest, dto.users.alice],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      const authed = authUserOwner(context as unknown as Context, user);
      expect(Error.isError(authed)).toBe(false);
    });

    test.each(denies)("denies %#", (context, user) => {
      const authed = authUserOwner(context as unknown as Context, user);
      expect(Error.isError(authed)).toBe(true);
    });
  });
}
