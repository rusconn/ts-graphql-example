import * as Prisma from "@/prisma/mod.ts";
import { isAuthenticated } from "../common/authorizers.ts";
import type { MutationResolvers } from "../common/schema.ts";
import { todoNodeId } from "./common/adapter.ts";
import { parseTodoNodeId } from "./common/parser.ts";

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
  const authed = isAuthenticated(context.user);

  const id = parseTodoNodeId(args.id);

  try {
    const todo = await context.prisma.todo.delete({
      where: { id, userId: authed.id },
      select: { id: true },
    });

    return {
      __typename: "DeleteTodoSuccess",
      id: todoNodeId(todo.id),
    };
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      context.logger.error(e, "error info");

      return {
        __typename: "TodoNotFoundError",
        message: "todo not found",
      };
    }

    throw e;
  }
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { validTodoIds, invalidTodoIds } = await import("tests/data/graph.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: { id: validTodoIds[0] },
    user: admin,
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
    const allows = [admin, alice];

    const denys = [guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    test.each(validTodoIds)("valids %#", id => {
      void expect(resolve({ args: { id } })).resolves.not.toThrow(ParseErr);
    });

    test.each(invalidTodoIds)("invalids %#", id => {
      void expect(resolve({ args: { id } })).rejects.toThrow(ParseErr);
    });
  });
}
