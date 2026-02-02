import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authAdmin = (ctx: AuthContext) => {
  if (ctx.user?.role !== "admin") {
    return authErr();
  }

  return ctx.user;
};

if (import.meta.vitest) {
  const { ctx } = await import("../_testData/context.ts");

  const allows = [ctx.user.admin];
  const denies = [ctx.user.alice, ctx.user.guest];

  test.each(allows)("allows %#", (user) => {
    const authed = authAdmin({ user });
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authAdmin({ user });
    expect(Error.isError(authed)).toBe(true);
  });
}
