import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoStatusChange(id: ID!, status: TodoStatus!): TodoStatusChangeResult
  }

  union TodoStatusChangeResult = TodoStatusChangeSuccess | ResourceNotFoundError

  type TodoStatusChangeSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["todoStatusChange"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseTodoId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const todo = await context.api.todo.update(
    { id, userId: authed.id }, //
    { status: args.status },
  );

  return todo
    ? {
        __typename: "TodoStatusChangeSuccess",
        todo,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
};
