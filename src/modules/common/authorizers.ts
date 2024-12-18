import type { Context } from "../../context.ts";

export const authErr = () => {
  return new Error("Forbidden");
};

export type AuthContext = Pick<Context, "user">;

export const authGuest = (context: AuthContext) => {
  return context.user == null //
    ? context.user
    : authErr();
};

export const authAuthenticated = (context: AuthContext) => {
  return context.user != null //
    ? context.user
    : authErr();
};

if (import.meta.vitest) {
  const { context } = await import("./testData/context.ts");

  describe("authGuest", () => {
    const allows = [context.guest];
    const denies = [context.alice, context.bob];

    test.each(allows)("allows %#", (user) => {
      const authed = authGuest({ user });
      expect(authed instanceof Error).toBe(false);
    });

    test.each(denies)("denies %#", (user) => {
      const authed = authGuest({ user });
      expect(authed instanceof Error).toBe(true);
    });
  });

  describe("authAuthenticated", () => {
    const allows = [context.alice, context.bob];
    const denies = [context.guest];

    test.each(allows)("allows %#", (user) => {
      const authed = authAuthenticated({ user });
      expect(authed instanceof Error).toBe(false);
    });

    test.each(denies)("denies %#", (user) => {
      const authed = authAuthenticated({ user });
      expect(authed instanceof Error).toBe(true);
    });
  });
}
