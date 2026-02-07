import type { Context } from "../../../context.ts";
import { authAdmin } from "../admin.ts";
import { authTodoOwner } from "./todoOwner.ts";
import type { ParentTodo } from "./types.ts";

export const authAdminOrTodoOwner = (context: Context, todo: ParentTodo) => {
  const ctx = authAdmin(context);

  if (Error.isError(ctx)) {
    return authTodoOwner(context, todo);
  }

  return ctx;
};

if (import.meta.vitest) {
  const { context } = await import("../../_testData/context.ts");
  const { db } = await import("../../_testData/db.ts");

  const allows = [
    [context.admin, db.todos.admin1],
    [context.admin, db.todos.alice1],
    [context.alice, db.todos.alice1],
  ] as const;

  const denies = [
    [context.alice, db.todos.admin1],
    [context.guest, db.todos.admin1],
    [context.guest, db.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (context, todo) => {
    const authed = authAdminOrTodoOwner(context as Context, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context, todo) => {
    const authed = authAdminOrTodoOwner(context as Context, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
