import type { ContextForAuthed } from "../../yoga/context.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { TodoResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User @semanticNonNull @complexity(value: 3) @auth(policy: ADMIN_OR_TODO_OWNER)
  }
`;

export const resolver: NonNullable<TodoResolvers["user"]> = async (parent, _args, context) => {
  const ctx = context as ContextForAuthed;

  const user = await ctx.queries.user.load(parent.userId);
  if (!user) {
    throw internalServerError();
  }

  return user;
};
