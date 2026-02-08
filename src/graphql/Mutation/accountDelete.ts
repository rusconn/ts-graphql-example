import { deleteRefreshTokenCookie } from "../../util/refreshToken.ts";
import type { MutationResolvers } from "../_schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { userId } from "../User/id.ts";

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

  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  try {
    await ctx.kysely.transaction().execute(async (trx) => {
      await ctx.repos.todo.removeByUserId(user.id, trx);
      await ctx.repos.refreshToken.removeByUserId(user.id, trx);
      await ctx.repos.user.remove(user.id, trx);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  await deleteRefreshTokenCookie(context.request);

  return {
    __typename: "AccountDeleteSuccess",
    id: userId(ctx.user.id),
  };
};
