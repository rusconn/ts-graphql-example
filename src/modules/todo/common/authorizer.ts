import { type AuthContext, authAdmin, authErr } from "../../common/authorizers.ts";
import type { Todo } from "./resolver.ts";

type AuthTodo = Pick<Todo, "userId">;

export const authAdminOrTodoOwner = (context: AuthContext, todo: AuthTodo) => {
  const authed = authAdmin(context);

  return authed instanceof Error //
    ? authTodoOwner(context, todo)
    : authed;
};

export const authTodoOwner = (context: AuthContext, todo: AuthTodo) => {
  return context.user?.id === todo.userId //
    ? context.user
    : authErr();
};

if (import.meta.vitest) {
  const { db } = await import("../../common/testData/db.ts");
  const { context } = await import("../../common/testData/context.ts");

  describe("authAdminOrTodoOwner", () => {
    const allows = [
      [context.admin, db.adminTodo],
      [context.admin, db.aliceTodo],
      [context.alice, db.aliceTodo],
    ] as const;

    const denies = [
      [context.alice, db.adminTodo],
      [context.guest, db.adminTodo],
      [context.guest, db.aliceTodo],
    ] as const;

    test.each(allows)("allows %#", (contextUser, todo) => {
      const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
      expect(authed instanceof Error).toBe(false);
    });

    test.each(denies)("denies %#", (contextUser, todo) => {
      const authed = authAdminOrTodoOwner({ user: contextUser }, todo);
      expect(authed instanceof Error).toBe(true);
    });
  });

  describe("authTodoOwner", () => {
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
  });
}
