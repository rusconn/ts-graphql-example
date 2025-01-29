import { TodoStatus } from "../../db/generated/types.ts";
import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoComplete(id: ID!): TodoCompleteResult
  }

  union TodoCompleteResult = TodoCompleteSuccess | InvalidInputError | ResourceNotFoundError

  type TodoCompleteSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoComplete"] = async (_parent, args, context) => {
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

  const todo = await context.api.todo.update(
    { id: parsed, userId: authed.id },
    { status: TodoStatus.DONE },
  );

  return todo
    ? {
        __typename: "TodoCompleteSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "todo not found",
      };
};
