import { authAuthenticated } from "../../common/authorizers.ts";
import type { MutationResolvers } from "../../common/schema.ts";
import { todoNodeId } from "../common/adapter.ts";
import { parseTodoNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deleteTodo(id: ID!): DeleteTodoResult
  }

  union DeleteTodoResult = DeleteTodoSuccess | TodoNotFoundError

  type DeleteTodoSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context.user);

  const id = parseTodoNodeId(args.id);

  const found = await context.prisma.todo.findUnique({
    where: { id, userId: authed.id },
  });

  if (!found) {
    return {
      __typename: "TodoNotFoundError",
      message: "todo not found",
    };
  }

  const todo = await context.prisma.todo.delete({
    where: { id, userId: authed.id },
    select: { id: true },
  });

  return {
    __typename: "DeleteTodoSuccess",
    id: todoNodeId(todo.id),
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../user/common/test.ts");
  const { validTodoIds, invalidTodoIds } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: validTodoIds[0] },
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin, context.alice];

    const denies = [context.guest];

    test.each(allows)("allows %#", async user => {
      await resolve({ user });
    });

    test.each(denies)("denies %#", async user => {
      expect.assertions(1);
      try {
        await resolve({ user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("Parsing", () => {
    test.each(validTodoIds)("valids %#", async id => {
      await resolve({ args: { id } });
    });

    test.each(invalidTodoIds)("invalids %#", async id => {
      expect.assertions(1);
      try {
        await resolve({ args: { id } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
