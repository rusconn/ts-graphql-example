import type { ResolversParentTypes } from "../../../schema.ts";
import { type AuthContext, authAdmin, authErr } from "../../common/authorizers.ts";

type ParentTodo = Pick<ResolversParentTypes["Todo"], "userId">;

export const authAdminOrTodoOwner = (context: AuthContext, todo: ParentTodo) => {
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    return authTodoOwner(context, todo);
  }

  return authed;
};

export const authTodoOwner = (context: AuthContext, todo: ParentTodo) => {
  if (context.user?.id !== todo.userId) {
    return authErr();
  }

  return context.user;
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
