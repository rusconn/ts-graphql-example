import { TodoStatus } from "../../db/generated/types.ts";
import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoUncomplete(id: ID!): TodoUncompleteResult
  }

  union TodoUncompleteResult = TodoUncompleteSuccess | ResourceNotFoundError

  type TodoUncompleteSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoUncomplete"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseTodoId(args);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const todo = await context.api.todo.update(
    { id, userId: authed.id },
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
