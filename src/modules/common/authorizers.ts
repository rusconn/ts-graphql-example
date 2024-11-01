import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";
import type { Context } from "./resolvers.ts";

export const authErr = () =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
  });

export type AuthContext = Pick<Context, "user">;

export const auth = (context: AuthContext) => {
  return context.user;
};

export const authAdmin = (context: AuthContext) => {
  if (context.user?.role === "ADMIN") return context.user;
  throw authErr();
};

export const authGuest = (context: AuthContext) => {
  if (context.user == null) return context.user;
  throw authErr();
};

export const authAuthenticated = (context: AuthContext) => {
  if (context.user != null) return context.user;
  throw authErr();
};

if (import.meta.vitest) {
  const { context } = await import("./testData/context.ts");

  describe("auth", () => {
    const allows = [context.admin, context.alice, context.guest];

    test.each(allows)("allows %#", (user) => {
      auth({ user });
    });
  });

  describe("authAdmin", () => {
    const allows = [context.admin];
    const denies = [context.alice, context.guest];

    test.each(allows)("allows %#", (user) => {
      authAdmin({ user });
    });

    test.each(denies)("denies %#", (user) => {
      expect.assertions(1);
      try {
        authAdmin({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("authGuest", () => {
    const allows = [context.guest];
    const denies = [context.admin, context.alice];

    test.each(allows)("allows %#", (user) => {
      authGuest({ user });
    });

    test.each(denies)("denies %#", (user) => {
      expect.assertions(1);
      try {
        authGuest({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("authAuthenticated", () => {
    const allows = [context.admin, context.alice];
    const denies = [context.guest];

    test.each(allows)("allows %#", (user) => {
      authAuthenticated({ user });
    });

    test.each(denies)("denies %#", (user) => {
      expect.assertions(1);
      try {
        authAuthenticated({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
