import * as UserToken from "../../models/user/token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { getRefreshTokenCookie, setRefreshTokenCookie } from "../../util/refreshToken.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    tokenRefresh: TokenRefreshResult @semanticNonNull @complexity(value: 100)
  }

  union TokenRefreshResult = TokenRefreshSuccess | InvalidRefreshTokenError

  type TokenRefreshSuccess {
    token: String!
  }

  type InvalidRefreshTokenError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["tokenRefresh"] = async (_parent, _args, context) => {
  const cookie = await getRefreshTokenCookie(context.request);

  if (!cookie) {
    throw badUserInputErr("Specify refresh token.");
  }

  if (!UserToken.is(cookie.value)) {
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const refreshToken = await context.repos.user.updateTokenByToken(cookie.value);

  if (!refreshToken) {
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const user = await context.repos.user.getByToken(refreshToken);

  if (!user) {
    throw internalServerError();
  }

  const token = await signedJwt(user);
  await setRefreshTokenCookie(context.request, refreshToken);

  return {
    __typename: "TokenRefreshSuccess",
    token,
  };
};
