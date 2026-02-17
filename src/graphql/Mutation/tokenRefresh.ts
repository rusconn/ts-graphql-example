import { RefreshToken } from "../../domain/entities.ts";
import type { Context } from "../../server/context.ts";
import { signedJwt } from "../../util/access-token.ts";
import * as RefreshTokenCookie from "../../util/refresh-token-cookie.ts";
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
  return await logic(context);
};

const logic = async (context: Context): Promise<ReturnType<MutationResolvers["tokenRefresh"]>> => {
  const cookie = await RefreshTokenCookie.get(context);
  if (!cookie) {
    throw badUserInputErr("Specify refresh token.");
  }
  if (!RefreshToken.Token.is(cookie.value)) {
    await RefreshTokenCookie.clear(context);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid. Please login.",
    };
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);
  const refreshToken = await context.repos.refreshToken.find(hashed);
  if (!refreshToken) {
    await RefreshTokenCookie.clear(context);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid. Please login.",
    };
  }
  if (RefreshToken.isExpired(refreshToken)) {
    await RefreshTokenCookie.clear(context);
    return {
      __typename: "RefreshTokenExpiredError",
      message: "The refresh token is expired. Please login.",
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

  await RefreshTokenCookie.set(context, {
    value: rawRefreshToken,
    expires: newRefreshToken.expiresAt,
  });

  return {
    __typename: "TokenRefreshSuccess",
    token: await signedJwt({ id: newRefreshToken.userId }),
  };
};
