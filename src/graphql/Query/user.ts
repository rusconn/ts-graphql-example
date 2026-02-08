import type { QueryResolvers } from "../_schema.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User @complexity(value: 3)
  }
`;

export const resolver: QueryResolvers["user"] = async (_parent, args, context) => {
  const ctx = authAdmin(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = unwrapOrElse(parseUserId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  const user = await ctx.queries.user.find(id);

  return user ?? null;
};
