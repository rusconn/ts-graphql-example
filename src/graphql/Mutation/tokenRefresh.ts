import { RefreshToken } from "../../domain/entities.ts";
import { signedJwt } from "../../util/access-token.ts";
import {
  deleteRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../../util/refresh-token.ts";
import { badUserInputErr } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_schema.ts";

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
  const cookie = await getRefreshTokenCookie(context);
  if (!cookie) {
    throw badUserInputErr("Specify refresh token.");
  }
  if (!RefreshToken.Token.is(cookie.value)) {
    await deleteRefreshTokenCookie(context);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid. To get a valid refresh token, please login.",
    };
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);
  const refreshToken = await context.repos.refreshToken.find(hashed);
  if (!refreshToken) {
    await deleteRefreshTokenCookie(context);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid. To get a valid refresh token, please login.",
    };
  }
  if (RefreshToken.isExpired(refreshToken)) {
    await deleteRefreshTokenCookie(context);
    return {
      __typename: "RefreshTokenExpiredError",
      message: "The refresh token is expired. To get a fresh refresh token, please login.",
    };
  }

  const { rawRefreshToken, refreshToken: newRefreshToken } = await RefreshToken.create(
    refreshToken.userId,
  );
  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
      await repos.refreshToken.add(newRefreshToken);
    });
  } catch (e) {
    throw internalServerError(e);
  }

  await setRefreshTokenCookie(context, rawRefreshToken, newRefreshToken.expiresAt);

  return {
    __typename: "TokenRefreshSuccess",
    token: await signedJwt({ id: newRefreshToken.userId }),
  };
};
