import type { Context } from "../../context.ts";

export const authErr = () => {
  return new Error("Forbidden");
};

export type AuthContext = Pick<Context, "user">;

export const authAdmin = (context: AuthContext) => {
  return context.user?.role === "ADMIN" //
    ? context.user
    : authErr();
};

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

  describe("authAdmin", () => {
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
  });

  describe("authGuest", () => {
    const allows = [context.guest];
    const denies = [context.admin, context.alice];

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
  });
}
