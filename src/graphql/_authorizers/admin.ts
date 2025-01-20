import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authAdmin = (context: AuthContext) => {
  if (context.user?.role !== "ADMIN") {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.admin];
  const denies = [context.alice, context.guest];

  test.each(allows)("allows %#", (user) => {
    const authed = authAdmin({ user });
    expect(authed instanceof Error).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authAdmin({ user });
    expect(authed instanceof Error).toBe(true);
  });
}
