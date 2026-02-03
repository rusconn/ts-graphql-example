import type { Context } from "../../../context.ts";
import { authErr } from "../util.ts";
import type { ParentTodo } from "./types.ts";

export const authTodoOwner = (context: Context, todo: ParentTodo) => {
  if (context.role === "guest" || context.user.id !== todo.userId) {
    return authErr();
  }

  return context;
};

if (import.meta.vitest) {
  const { context } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  const allows = [
    [context.admin, domain.todos.admin1],
    [context.alice, domain.todos.alice1],
  ] as const;

  const denies = [
    [context.admin, domain.todos.alice1],
    [context.alice, domain.todos.admin1],
    [context.guest, domain.todos.admin1],
    [context.guest, domain.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (context, todo) => {
    const authed = authTodoOwner(context as Context, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context, todo) => {
    const authed = authTodoOwner(context as Context, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
