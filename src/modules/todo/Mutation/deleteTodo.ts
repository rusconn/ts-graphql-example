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
  const authed = authAuthenticated(context);

  const id = parseTodoNodeId(args.id);

  const todo = await context.db
    .deleteFrom("Todo")
    .where("id", "=", id)
    .where("userId", "=", authed.id)
    .returning("id")
    .executeTakeFirst();

  return todo
    ? {
        __typename: "DeleteTodoSuccess",
        id: todoNodeId(todo.id),
      }
    : {
        __typename: "TodoNotFoundError",
        message: "todo not found",
      };
};
