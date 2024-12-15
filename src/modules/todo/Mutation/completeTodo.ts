import { TodoStatus } from "../../../db/types.ts";
import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseTodoNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    completeTodo(id: ID!): CompleteTodoResult
  }

  union CompleteTodoResult = CompleteTodoSuccess | ResourceNotFoundError

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
    .set({
      updatedAt: new Date(),
      status: TodoStatus.DONE,
    })
    .returningAll()
    .executeTakeFirst();

  return todo
    ? {
        __typename: "CompleteTodoSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};
