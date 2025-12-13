import { RefreshToken } from "../../domain/user-token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { getRefreshTokenCookie } from "../../util/refreshToken.ts";
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

  if (!RefreshToken.is(cookie.value)) {
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const hashed = await RefreshToken.hash(cookie.value);
  const user = await context.repos.user.findBaseByRefreshToken(hashed);

  if (!user) {
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const touched = await context.repos.userToken.touch(hashed, new Date());

  if (!touched) {
    throw internalServerError();
  }

  const token = await signedJwt(user);

  return {
    __typename: "TokenRefreshSuccess",
    token,
  };
};
