import { type AuthContext, authAdmin, authErr } from "../../common/authorizers.ts";
import type { Todo } from "./resolver.ts";

type AuthTodo = Pick<Todo, "userId">;

export const authAdminOrTodoOwner = (context: AuthContext, todo: AuthTodo) => {
  try {
    return authAdmin(context);
  } catch {
    return authTodoOwner(context, todo);
  }
};

export const authTodoOwner = (context: AuthContext, todo: AuthTodo) => {
  if (context.user?.id === todo.userId) return context.user;
  throw authErr();
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");
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
      authAdminOrTodoOwner({ user: contextUser }, todo);
    });

    test.each(denies)("denies %#", (contextUser, todo) => {
      expect.assertions(1);
      try {
        authAdminOrTodoOwner({ user: contextUser }, todo);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
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
      authTodoOwner({ user: contextUser }, todo);
    });

    test.each(denies)("denies %#", (contextUser, todo) => {
      expect.assertions(1);
      try {
        authTodoOwner({ user: contextUser }, todo);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
