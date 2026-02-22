import type { Context } from "../../../yoga/context.ts";
import type { Todo } from "../../Todo/_mapper.ts";
import { authAdmin } from "../admin.ts";
import { authTodoOwner } from "./owner.ts";

export const authAdminOrTodoOwner = (context: Context, todo: Todo) => {
  const ctx = authAdmin(context);

  if (Error.isError(ctx)) {
    return authTodoOwner(context, todo);
  }

  return ctx;
};

if (import.meta.vitest) {
  const { context, dto } = await import("../../_test/data.ts");

  const allows = [
    [context.admin, dto.todos.admin1],
    [context.admin, dto.todos.alice1],
    [context.alice, dto.todos.alice1],
  ] as const;

  const denies = [
    [context.alice, dto.todos.admin1],
    [context.guest, dto.todos.admin1],
    [context.guest, dto.todos.alice1],
  ] as const;

  test.each(allows)("allows %#", (context, todo) => {
    const authed = authAdminOrTodoOwner(context as unknown as Context, todo);
    expect(Error.isError(authed)).toBe(false);
  });

  test.each(denies)("denies %#", (context, todo) => {
    const authed = authAdminOrTodoOwner(context as unknown as Context, todo);
    expect(Error.isError(authed)).toBe(true);
  });
}
