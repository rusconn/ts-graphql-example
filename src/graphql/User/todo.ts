import type { UserResolvers } from "../../schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo @complexity(value: 3)
  }
`;

export const resolver: NonNullable<UserResolvers["todo"]> = async (parent, args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = parseTodoId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const todo = await ctx.queries.todo.loadTheir({
    id,
    userId: parent.id,
  });

  return todo ?? null;
};
