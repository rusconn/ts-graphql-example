import * as DB from "@/db/mod.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import type { MutationResolvers } from "../../common/schema.ts";
import { parseTodoNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    completeTodo(id: ID!): CompleteTodoResult
  }

  union CompleteTodoResult = CompleteTodoSuccess | TodoNotFoundError

  type CompleteTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["completeTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parseTodoNodeId(args.id);

  const todo = await context.db
    .updateTable("Todo")
    .where("id", "=", id)
    .where("userId", "=", authed.id)
    .set({ status: DB.TodoStatus.DONE })
    .returningAll()
    .executeTakeFirst();

  return todo
    ? {
        __typename: "CompleteTodoSuccess",
        todo,
      }
    : {
        __typename: "TodoNotFoundError",
        message: "todo not found",
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
