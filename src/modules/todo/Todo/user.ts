import type { TodoResolvers } from "../../common/schema.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  const todo = await getTodo(context.prisma, parent);

  authAdminOrTodoOwner(context.user, todo);

  return { id: todo.userId };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");
  const { db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    const prisma = {
      todo: { findUnique: async () => parent },
    } as unknown as Params["prisma"];

    return resolver(parent, {}, dummyContext({ prisma, user }));
  };

  describe("Authorization", () => {
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

    test.each(allows)("allows %#", async (user, parent) => {
      await resolve({ parent, user });
    });

    test.each(denies)("denies %#", async (user, parent) => {
      expect.assertions(1);
      try {
        await resolve({ parent, user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });
}
