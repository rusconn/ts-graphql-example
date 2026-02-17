import type { Context } from "../../../server/context.ts";
import type { Todo } from "../../Todo/_mapper.ts";
import { authErr } from "../_shared.ts";

export const authTodoOwner = (context: Context, todo: Todo) => {
  if (context.role === "GUEST" || context.user.id !== todo.userId) {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context, dto } = await import("../../_test/data.ts");

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
    const authed = authTodoOwner(context as unknown as Context, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context, todo) => {
    const authed = authTodoOwner(context as unknown as Context, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
