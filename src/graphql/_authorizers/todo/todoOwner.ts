import type { AuthContext } from "../types.ts";
import { authErr } from "../util.ts";
import type { ParentTodo } from "./types.ts";

export const authTodoOwner = (ctx: AuthContext, todo: ParentTodo) => {
  if (ctx.user?.id !== todo.userId) {
    return authErr();
  }

  return ctx.user;
};

if (import.meta.vitest) {
  const { ctx } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  const allows = [
    [ctx.user.admin, domain.todos.admin1],
    [ctx.user.alice, domain.todos.alice1],
  ] as const;

  const denies = [
    [ctx.user.admin, domain.todos.alice1],
    [ctx.user.alice, domain.todos.admin1],
    [ctx.user.guest, domain.todos.admin1],
    [ctx.user.guest, domain.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (contextUser, todo) => {
    const authed = authTodoOwner({ user: contextUser }, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (contextUser, todo) => {
    const authed = authTodoOwner({ user: contextUser }, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
