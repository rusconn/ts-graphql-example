import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authAdmin = (context: AuthContext) => {
  if (context.user?.role !== "admin") {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.user.admin];
  const denies = [context.user.alice, context.user.guest];

  test.each(allows)("allows %#", (user) => {
    const authed = authAdmin({ user });
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authAdmin({ user });
    expect(Error.isError(authed)).toBe(true);
  });
}
