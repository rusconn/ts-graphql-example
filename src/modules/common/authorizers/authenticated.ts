import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authAuthenticated = (context: AuthContext) => {
  if (context.user == null) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { context } = await import("../testData/context.ts");

  const allows = [context.admin, context.alice];
  const denies = [context.guest];

  test.each(allows)("allows %#", (user) => {
    const authed = authAuthenticated({ user });
    expect(authed instanceof Error).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authAuthenticated({ user });
    expect(authed instanceof Error).toBe(true);
  });
}
