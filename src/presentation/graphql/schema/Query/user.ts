import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";
import type { QueryResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User @complexity(value: 3)
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const ctx = authAdmin(context);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const id = unwrapOrElse(parseUserId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const user = await ctx.queries.user.find(id);

  return user ?? null;
};
