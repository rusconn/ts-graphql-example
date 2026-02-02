import type { MutationResolvers } from "../../schema.ts";
import { todoId } from "../_adapters/todo/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    todoDelete(id: ID!): TodoDeleteResult @semanticNonNull @complexity(value: 5)
  }

  union TodoDeleteResult = TodoDeleteSuccess | ResourceNotFoundError

  type TodoDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, ctx) => {
  const authed = authAuthenticated(ctx);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const user = await ctx.repos.user.findByDbId(authed.id);
  if (!user) {
    throw internalServerError();
  }

  const success = await ctx.repos.todo.delete({
    id,
    userId: user.id,
  });
  if (!success) {
    return {
      __typename: "ResourceNotFoundError",
      message: "The specified todo does not exist.",
    };
  }

  return {
    __typename: "TodoDeleteSuccess",
    id: todoId(id),
  };
};
