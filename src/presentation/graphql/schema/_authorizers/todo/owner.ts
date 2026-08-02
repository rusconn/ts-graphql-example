import type { Context, ContextForAuthed } from "../../../yoga/context.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { Todo } from "../../Todo/_mapper.ts";

export function assertTodoOwner(context: Context, todo: Todo): asserts context is ContextForAuthed {
  if (context.role === "GUEST" || context.user.id !== todo.userId) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { context, dto } = await import("../../_test/data.ts");
  const { ErrorCode } = await import("../../_types.ts");

  const allows = [
    [context.admin, dto.todos.admin1],
    [context.alice, dto.todos.alice1],
  ] as const;

  const denies = [
    [context.admin, dto.todos.alice1],
    [context.alice, dto.todos.admin1],
    [context.guest, dto.todos.admin1],
    [context.guest, dto.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (context, todo) => {
    expect(() => assertTodoOwner(context as unknown as Context, todo)).not.toThrow();
  });

  test.each(denies)("denies %#", (context, todo) => {
    expect(() => assertTodoOwner(context as unknown as Context, todo)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
