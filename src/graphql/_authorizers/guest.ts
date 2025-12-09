import type { AuthContext } from "./types.ts";
import { authErr } from "./util.ts";

export const authGuest = (context: AuthContext) => {
  if (context.user != null) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.user.guest];
  const denies = [context.user.admin, context.user.alice];

  test.each(allows)("allows %#", (user) => {
    const authed = authGuest({ user });
    expect(authed instanceof Error).toBe(false);
  });

  test.each(denies)("denies %#", (user) => {
    const authed = authGuest({ user });
    expect(authed instanceof Error).toBe(true);
  });
}
