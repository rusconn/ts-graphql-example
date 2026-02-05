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

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const user = await ctx.repos.user.findByDbId(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const result = await ctx.repos.todo.delete(id);
  switch (result) {
    case "Ok":
      break;
    case "NotFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    default:
      throw new Error(result satisfies never);
  }

  return {
    __typename: "TodoDeleteSuccess",
    id: todoId(id),
  };
};
