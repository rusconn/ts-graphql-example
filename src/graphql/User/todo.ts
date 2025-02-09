import type { UserResolvers } from "../../schema.ts";
import { todoColumnsUnchecked } from "../Todo/_mapper.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = async (parent, args, context, info) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseTodoId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const todo = await context.api.todo.loadTheir(
    { id, userId: parent.id! },
    { columns: todoColumnsUnchecked(info) },
  );

  return todo ?? null;
};
