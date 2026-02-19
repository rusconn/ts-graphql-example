import { logout } from "../../../../application/usecases/logout.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: Void @semanticNonNull @complexity(value: 100)
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const cookie = await RefreshTokenCookie.get(context);
  if (!cookie) {
    return;
  }

  await RefreshTokenCookie.clear(context);

  const result = await logout(context, cookie.value);
  switch (result.type) {
    case "InvalidRefreshToken":
    case "RefreshTokenEntityNotFound":
      return;
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      return;
    default:
      throw new Error(result satisfies never);
  }
};
