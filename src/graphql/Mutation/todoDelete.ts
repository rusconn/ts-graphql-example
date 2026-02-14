import { EntityNotFoundError } from "../../domain/unit-of-works/_errors/entity-not-found.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/global/bad-user-input.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import type { MutationResolvers } from "../_schema.ts";
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
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.remove(id);
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
