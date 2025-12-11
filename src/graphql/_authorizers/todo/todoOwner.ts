import type { AuthContext } from "../types.ts";
import { authErr } from "../util.ts";
import type { ParentTodo } from "./types.ts";

export const authTodoOwner = (context: AuthContext, todo: ParentTodo) => {
  if (context.user?.id !== todo.userId) {
    return authErr();
  }

  return context.user;
};

if (import.meta.vitest) {
  const { context } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  const allows = [
    [context.user.admin, domain.todos.admin1],
    [context.user.alice, domain.todos.alice1],
  ] as const;

  const denies = [
    [context.user.admin, domain.todos.alice1],
    [context.user.alice, domain.todos.admin1],
    [context.user.guest, domain.todos.admin1],
    [context.user.guest, domain.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (contextUser, todo) => {
    const authed = authTodoOwner({ user: contextUser }, todo);
    expect(authed instanceof Error).toBe(false);
  });

  test.each(denies)("denies %#", (contextUser, todo) => {
    const authed = authTodoOwner({ user: contextUser }, todo);
    expect(authed instanceof Error).toBe(true);
  });
}
