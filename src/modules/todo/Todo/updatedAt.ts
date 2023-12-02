import type { TodoResolvers } from "../../common/schema.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { fullTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime
  }
`;

export const resolver: TodoResolvers["updatedAt"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authAdminOrTodoOwner(context.user, todo);

  return todo.updatedAt;
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../../common/authorizers.ts");
  const { full } = await import("../../common/resolvers.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");
  const { db } = await import("../common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    return resolver(parent, {}, dummyContext({ user }));
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

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denies)("denies %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).rejects.toThrow(AuthErr);
    });
  });
}
