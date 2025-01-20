import type { MutationResolvers } from "../../schema.ts";
import { todoId } from "../_adapters/todo/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoDelete(id: ID!): TodoDeleteResult
  }

  union TodoDeleteResult = TodoDeleteSuccess | InvalidInputError | ResourceNotFoundError

  type TodoDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, context) => {
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

  const todo = await context.api.userTodo.delete({
    userId: authed.id,
    todoId: parsed,
  });

  return todo
    ? {
        __typename: "TodoDeleteSuccess",
        id: todoId(todo.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};
