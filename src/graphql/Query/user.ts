import type { QueryResolvers } from "../../schema.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User @complexity(value: 3)
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, ctx) => {
  const authed = authAdmin(ctx);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  const id = parseUserId(args.id);
  if (Error.isError(id)) {
    throw badUserInputErr(id.message, id);
  }

  const user = await ctx.queries.user.findById(id);

  return user ?? null;
};
