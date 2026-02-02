import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authAuthenticated = (ctx: AuthContext) => {
  if (ctx.user == null) {
    return authErr();
  }

  return ctx.user;
};

if (import.meta.vitest) {
  const { ctx } = await import("../_testData/context.ts");

  const allows = [ctx.user.admin, ctx.user.alice];
  const denies = [ctx.user.guest];

  test.each(allows)("allows %#", (user) => {
    const authed = authAuthenticated({ user });
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authAuthenticated({ user });
    expect(Error.isError(authed)).toBe(true);
  });
}
