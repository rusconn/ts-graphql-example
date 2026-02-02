import { authAdmin } from "../admin.ts";
import type { AuthContext } from "../types.ts";
import { authTodoOwner } from "./todoOwner.ts";
import type { ParentTodo } from "./types.ts";

export const authAdminOrTodoOwner = (ctx: AuthContext, todo: ParentTodo) => {
  const authed = authAdmin(ctx);

  if (Error.isError(authed)) {
    return authTodoOwner(ctx, todo);
  }

  return authed;
};

if (import.meta.vitest) {
  const { ctx } = await import("../../_testData/context.ts");
  const { domain } = await import("../../_testData/domain.ts");

  const allows = [
    [ctx.user.admin, domain.todos.admin1],
    [ctx.user.admin, domain.todos.alice1],
    [ctx.user.alice, domain.todos.alice1],
  ] as const;

  const denies = [
    [ctx.user.alice, domain.todos.admin1],
    [ctx.user.guest, domain.todos.admin1],
    [ctx.user.guest, domain.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (contextUser, todo) => {
    const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (contextUser, todo) => {
    const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
