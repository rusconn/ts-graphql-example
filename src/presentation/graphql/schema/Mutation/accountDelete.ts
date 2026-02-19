import { deleteAccount } from "../../../../application/usecases/delete-account.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";
import { userId } from "../User/id.ts";

// TODO: Void
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
    throw forbiddenError(ctx);
  }

  const result = await deleteAccount(ctx);
  switch (result.type) {
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      await RefreshTokenCookie.clear(ctx);
      return {
        __typename: "AccountDeleteSuccess",
        id: userId(ctx.user.id),
      };
    default:
      throw new Error(result satisfies never);
  }
};
