import type { Context } from "../../server/context.ts";
import { authErr } from "./util.ts";

export const authGuest = (context: Context) => {
  if (context.role !== "GUEST") {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.guest];
  const denies = [context.admin, context.alice];

  test.each(allows)("allows %#", (context) => {
    const authed = authGuest(context as unknown as Context);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context) => {
    const authed = authGuest(context as unknown as Context);
    expect(Error.isError(authed)).toBe(true);
  });
}
