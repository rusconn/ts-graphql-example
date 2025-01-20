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
  const { db } = await import("../../_testData/db.ts");
  const { context } = await import("../../_testData/context.ts");

  const allows = [
    [context.admin, db.adminTodo],
    [context.alice, db.aliceTodo],
  ] as const;

  const denies = [
    [context.admin, db.aliceTodo],
    [context.alice, db.adminTodo],
    [context.guest, db.adminTodo],
    [context.guest, db.aliceTodo],
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
