import { TodoStatus } from "../../db/generated/types.ts";
import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoUncomplete(id: ID!): TodoUncompleteResult
  }

  union TodoUncompleteResult = TodoUncompleteSuccess | InvalidInputError | ResourceNotFoundError

  type TodoUncompleteSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoUncomplete"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseTodoId(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      field: "id",
      message: parsed.message,
    };
  }

  const todo = await context.api.todo.update(
    { id: parsed, userId: authed.id },
    { status: TodoStatus.PENDING },
  );

  return todo
    ? {
        __typename: "TodoUncompleteSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
};
