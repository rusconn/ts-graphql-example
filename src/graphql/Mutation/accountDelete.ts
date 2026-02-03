import type { MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    紐づくリソースは全て削除される
    """
    accountDelete: AccountDeleteResult @semanticNonNull @complexity(value: 5)
  }

  union AccountDeleteResult = AccountDeleteSuccess

  type AccountDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["accountDelete"] = async (_parent, _args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const user = await ctx.repos.user.findByDbId(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  const success = await ctx.repos.user.delete(user.id);
  if (!success) {
    throw internalServerError();
  }

  return {
    __typename: "AccountDeleteSuccess",
    id: userId(ctx.user.id),
  };
};
