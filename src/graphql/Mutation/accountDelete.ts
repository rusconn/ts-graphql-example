import type { ContextForAuthed } from "../../server/context.ts";
import * as RefreshTokenCookie from "../../util/refresh-token-cookie.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_schema.ts";
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

  return await logic(ctx);
};

const logic = async (
  ctx: ContextForAuthed,
): Promise<ReturnType<MutationResolvers["accountDelete"]>> => {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    throw internalServerError();
  }

  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.removeByUserId(user.id);
      await repos.refreshToken.removeByUserId(user.id);
      await repos.user.remove(user.id);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  await RefreshTokenCookie.clear(ctx);

  return {
    __typename: "AccountDeleteSuccess",
    id: userId(ctx.user.id),
  };
};
