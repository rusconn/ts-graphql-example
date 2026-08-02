import type { Context, ContextForAdmin } from "../../yoga/context.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";

export function assertAdmin(context: Context): asserts context is ContextForAdmin {
  if (context.role !== "ADMIN") {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { context } = await import("../_test/data.ts");
  const { ErrorCode } = await import("../_types.ts");

  const allows = [context.admin];
  const denies = [context.alice, context.guest];

  test.each(allows)("allows %#", (context) => {
    expect(() => assertAdmin(context as unknown as Context)).not.toThrow();
  });

  test.each(denies)("denies %#", (context) => {
    expect(() => assertAdmin(context as unknown as Context)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
