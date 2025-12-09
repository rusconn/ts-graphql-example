import { authAdmin } from "../admin.ts";
import type { AuthContext } from "../types.ts";
import { authTodoOwner } from "./todoOwner.ts";
import type { ParentTodo } from "./types.ts";

export const authAdminOrTodoOwner = (context: AuthContext, todo: ParentTodo) => {
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    return authTodoOwner(context, todo);
  }

  return authed;
};

if (import.meta.vitest) {
  const { db } = await import("../../_testData/db.ts");
  const { context } = await import("../../_testData/context.ts");

  const allows = [
    [context.user.admin, db.todos.admin1],
    [context.user.admin, db.todos.alice1],
    [context.user.alice, db.todos.alice1],
  ] as const;

  const denies = [
    [context.user.alice, db.todos.admin1],
    [context.user.guest, db.todos.admin1],
    [context.user.guest, db.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (contextUser, todo) => {
    const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
    expect(authed instanceof Error).toBe(false);
  });

  test.each(denies)("denies %#", (contextUser, todo) => {
    const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
    expect(authed instanceof Error).toBe(true);
  });
}
