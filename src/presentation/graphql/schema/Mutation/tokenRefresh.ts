import { refreshToken } from "../../../../application/usecases/refresh-token.ts";
import * as AccessToken from "../../../_shared/auth/access-token.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    tokenRefresh: TokenRefreshResult @semanticNonNull @complexity(value: 200)
  }

  union TokenRefreshResult =
    | TokenRefreshSuccess
    | InvalidRefreshTokenError
    | RefreshTokenExpiredError

  type TokenRefreshSuccess {
    token: String!
  }

  type InvalidRefreshTokenError implements Error {
    message: String!
  }

  type RefreshTokenExpiredError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["tokenRefresh"] = async (_parent, _args, context) => {
  const cookie = await RefreshTokenCookie.get(context);
  if (!cookie) {
    throw badUserInputError("Specify refresh token.");
  }

  const result = await refreshToken(context, cookie.value);
  switch (result.type) {
    case "InvalidRefreshToken":
      await RefreshTokenCookie.clear(context);
      return {
        __typename: "InvalidRefreshTokenError",
        message: "The refresh token is invalid. Please login.",
      };
    case "RefreshTokenExpired":
      await RefreshTokenCookie.clear(context);
      return {
        __typename: "RefreshTokenExpiredError",
        message: "The refresh token is expired. Please login.",
      };
    case "TransactionFailed":
      throw internalServerError(result.cause);
    case "Success":
      await RefreshTokenCookie.set(context, {
        value: result.rawRefreshToken,
        expires: result.refreshToken.expiresAt,
      });
      return {
        __typename: "TokenRefreshSuccess",
        token: await AccessToken.sign({
          id: result.refreshToken.userId,
        }),
      };
    default:
      throw new Error(result satisfies never);
  }
};
