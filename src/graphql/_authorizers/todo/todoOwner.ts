import type { Context } from "../../../server/context.ts";
import { authErr } from "../util.ts";
import type { ParentTodo } from "./types.ts";

export const authTodoOwner = (context: Context, todo: ParentTodo) => {
  if (context.role === "GUEST" || context.user.id !== todo.userId) {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../../_testData/context.ts");
  const { dto } = await import("../../_testData/dto.ts");

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
