import { Result } from "neverthrow";

import { Todo } from "../../domain/models.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import type { MutationResolvers, MutationTodoStatusChangeArgs } from "../_schema.ts";

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

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    throw internalServerError(parsed.error);
  }

  const changedTodo = Todo.changeStatus(todo, parsed.value);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.update(changedTodo);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "TodoStatusChangeSuccess",
    todo: changedTodo,
  };
};

const parseArgs = (args: MutationTodoStatusChangeArgs) => {
  return Result.combineWithAllErrors([
    parseTodoStatus(args, "status", {
      optional: false,
      nullable: false,
    }),
  ]).map(([status]) => ({
    status,
  }));
};
