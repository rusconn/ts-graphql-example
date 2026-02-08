import { EntityNotFoundError } from "../../domain/repos/_shared/errors.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import type { MutationResolvers } from "../_schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import { todoId } from "../Todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoDelete(id: ID!): TodoDeleteResult @semanticNonNull @complexity(value: 5)
  }

  union TodoDeleteResult = TodoDeleteSuccess | ResourceNotFoundError

  type TodoDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  try {
    await ctx.kysely.transaction().execute(async (trx) => {
      await ctx.repos.todo.remove(id, trx);
    });
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    }
    throw internalServerError(e);
  }

  return {
    __typename: "TodoDeleteSuccess",
    id: todoId(id),
  };
};
