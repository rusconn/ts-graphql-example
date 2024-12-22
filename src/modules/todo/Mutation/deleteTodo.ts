import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { todoNodeId } from "../adapters/id.ts";
import { parseTodoId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deleteTodo(id: ID!): DeleteTodoResult
  }

  union DeleteTodoResult = DeleteTodoSuccess | InvalidInputError | ResourceNotFoundError

  type DeleteTodoSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteTodo"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseTodoId(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const todo = await context.db
    .deleteFrom("Todo")
    .where("id", "=", parsed)
    .where("userId", "=", authed.id)
    .returning("id")
    .executeTakeFirst();

  return todo
    ? {
        __typename: "DeleteTodoSuccess",
        id: todoNodeId(todo.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};
