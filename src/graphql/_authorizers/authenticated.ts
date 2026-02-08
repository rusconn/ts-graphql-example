import type { Context } from "../../server/context.ts";
import { authErr } from "./util.ts";

export const authAuthenticated = (context: Context) => {
  if (context.role === "GUEST") {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.admin, context.alice];
  const denies = [context.guest];

  test.each(allows)("allows %#", (context) => {
    const authed = authAuthenticated(context as unknown as Context);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context) => {
    const authed = authAuthenticated(context as unknown as Context);
    expect(Error.isError(authed)).toBe(true);
  });
}
