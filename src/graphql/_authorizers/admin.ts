import type { Context } from "../../server/context.ts";
import { authErr } from "./util.ts";

export const authAdmin = (context: Context) => {
  if (context.role !== "ADMIN") {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../_testData/context.ts");

  const allows = [context.admin];
  const denies = [context.alice, context.guest];

  test.each(allows)("allows %#", (context) => {
    const authed = authAdmin(context as unknown as Context);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context) => {
    const authed = authAdmin(context as unknown as Context);
    expect(Error.isError(authed)).toBe(true);
  });
}
