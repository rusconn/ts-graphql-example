import { GraphQLError } from "graphql";

import type { Context } from "../../context.ts";
import { ErrorCode } from "../../schema.ts";

export const authErr = () =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
  });

export type AuthContext = Pick<Context, "user">;

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

  describe("authGuest", () => {
    const allows = [context.guest];
    const denies = [context.alice, context.bob];

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
    const allows = [context.alice, context.bob];
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
