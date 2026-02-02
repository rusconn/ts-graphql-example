import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoStatusChange(id: ID!, status: TodoStatus!): TodoStatusChangeResult
      @semanticNonNull
      @complexity(value: 5)
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

  const todo = await context.repos.todo.find(id);
  if (!todo || todo.userId !== authed.id) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const changedTodo: typeof todo = {
    ...todo,
    status: args.status,
    updatedAt: new Date(),
  };

  const success = await context.repos.todo.save(changedTodo);
  if (!success) {
    throw internalServerError();
  }

  const found = await context.queries.todo.find(id);
  if (!found) {
    throw internalServerError();
  }

  return {
    __typename: "TodoStatusChangeSuccess",
    todo: found,
  };
};
