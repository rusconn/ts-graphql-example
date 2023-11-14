import type { TodoResolvers } from "../common/schema.ts";
import { isTodoOwner } from "./common/authorizer.ts";
import { fullTodo } from "./common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  isTodoOwner(context.user, todo);

  return todo.description;
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { adminTodo1: adminTodo, aliceTodo } = await import("tests/data/db.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { full } = await import("../common/resolvers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Params = Parameters<typeof dummyContext>[0];

  const resolve = ({ parent, user }: { parent: Parent; user: Params["user"] }) => {
    return resolver(parent, {}, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [admin, adminTodo],
      [alice, aliceTodo],
    ] as const;

    const denys = [
      [admin, aliceTodo],
      [alice, adminTodo],
      [guest, adminTodo],
      [guest, aliceTodo],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).rejects.toThrow(AuthErr);
    });
  });
}
