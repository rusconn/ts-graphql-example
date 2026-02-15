import * as Dto from "../../application/queries/dto.ts";
import { Todo } from "../../domain/entities.ts";
import type { ContextForAuthed } from "../../server/context.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/global/bad-user-input.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
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

  const parsed = unwrapOrElse(parseArgs(args), (e) => {
    throw internalServerError(e);
  });

  return await logic(ctx, id, parsed);
};

const parseArgs = (args: MutationTodoStatusChangeArgs) => {
  return parseTodoStatus(args, "status", {
    optional: false,
    nullable: false,
  });
};

const logic = async (
  ctx: ContextForAuthed,
  id: Todo.Id.Type,
  input: Parameters<typeof Todo.changeStatus>[1],
): Promise<ReturnType<MutationResolvers["todoStatusChange"]>> => {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  const changedTodo = Todo.changeStatus(todo, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.update(changedTodo);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "TodoStatusChangeSuccess",
    todo: Dto.Todo.fromDomain(changedTodo),
  };
};
