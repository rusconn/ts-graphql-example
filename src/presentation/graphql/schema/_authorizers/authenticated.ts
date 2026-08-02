import type { Context, ContextForAuthed } from "../../yoga/context.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";

export function assertAuthenticated(context: Context): asserts context is ContextForAuthed {
  if (context.role === "GUEST") {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { context } = await import("../_test/data.ts");
  const { ErrorCode } = await import("../_types.ts");

  const allows = [context.admin, context.alice];
  const denies = [context.guest];

  test.each(allows)("allows %#", (context) => {
    expect(() => assertAuthenticated(context as unknown as Context)).not.toThrow();
  });

  test.each(denies)("denies %#", (context) => {
    expect(() => assertAuthenticated(context as unknown as Context)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
