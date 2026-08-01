import { deleteTodo } from "../../../../application/usecases/delete-todo.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import type { ContextForAuthed } from "../../yoga/context.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import type { MutationResolvers } from "../_types.ts";
import { todoId } from "../Todo.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoDelete(id: ID!): TodoDeleteResult
      @semanticNonNull
      @complexity(value: 5)
      @auth(policy: AUTHENTICATED)
  }

  union TodoDeleteResult = TodoDeleteSuccess | ResourceNotFoundError

  type TodoDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, context) => {
  const ctx = context as ContextForAuthed;

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const result = await deleteTodo(ctx, id);
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
        __typename: "TodoDeleteSuccess",
        id: todoId(result.deletedId),
      };
    default:
      throw new Error(result satisfies never);
  }
};
