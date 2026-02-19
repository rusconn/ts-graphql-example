import { changeTodoStatus } from "../../../../application/usecases/change-todo-status.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";
import type { MutationResolvers, MutationTodoStatusChangeArgs } from "../_types.ts";

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
    throw forbiddenError(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const status = unwrapOrElse(parseArgs(args), (e) => {
    throw internalServerError(e);
  });

  const result = await changeTodoStatus(ctx, { id, status });
  switch (result.type) {
    case "ResourceNotFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoStatusChangeSuccess",
        todo: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationTodoStatusChangeArgs) => {
  return parseTodoStatus(args, "status", {
    optional: false,
    nullable: false,
  });
};
