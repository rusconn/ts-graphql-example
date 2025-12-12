import type { MutationResolvers } from "../../schema.ts";
import { todoId } from "../_adapters/todo/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
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
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseTodoId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const deleted = await context.repos.todo.delete({
    id,
    userId: authed.id,
  });

  return deleted
    ? {
        __typename: "TodoDeleteSuccess",
        id: todoId(id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
};
