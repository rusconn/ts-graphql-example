import { Todo } from "../../domain.ts";
import type { MutationResolvers, MutationTodoStatusChangeArgs } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { todoStatusMap } from "../_parsers/todo/status.ts";

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
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const parsed = parseArgs(args);
  const changedTodo = Todo.changeStatus(todo, parsed);
  const result = await ctx.repos.todo.update(changedTodo);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
      throw internalServerError();
    default:
      throw new Error(result satisfies never);
  }

  const changed = await ctx.queries.todo.find(id);
  if (!changed) {
    throw internalServerError();
  }

  return {
    __typename: "TodoStatusChangeSuccess",
    todo: changed,
  };
};

const parseArgs = (args: MutationTodoStatusChangeArgs) => {
  const status = parseStatus(args);

  return {
    status,
  };
};

const parseStatus = (args: MutationTodoStatusChangeArgs) => {
  return todoStatusMap[args.status];
};
