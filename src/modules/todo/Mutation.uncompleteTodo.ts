import * as Prisma from "@/prisma/mod.ts";
import { authAuthenticated } from "../common/authorizers.ts";
import { full } from "../common/resolvers.ts";
import type { MutationResolvers } from "../common/schema.ts";
import { parseTodoNodeId } from "./common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    uncompleteTodo(id: ID!): UncompleteTodoResult
  }

  union UncompleteTodoResult = UncompleteTodoSuccess | TodoNotFoundError

  type UncompleteTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["uncompleteTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context.user);

  const id = parseTodoNodeId(args.id);

  try {
    const todo = await context.prisma.todo.update({
      where: { id, userId: authed.id },
      data: { status: Prisma.TodoStatus.PENDING },
    });

    return {
      __typename: "UncompleteTodoSuccess",
      todo: full(todo),
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
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");
  const { context } = await import("../user/common/test.ts");
  const { validTodoIds, invalidTodoIds } = await import("./common/test.ts");

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

    const denys = [context.guest];

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
