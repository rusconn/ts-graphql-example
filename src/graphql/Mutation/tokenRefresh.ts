import { RefreshToken } from "../../domain/user-token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "../../util/refreshToken.ts";
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

export const resolver: MutationResolvers["tokenRefresh"] = async (_parent, _args, ctx) => {
  const cookie = await getRefreshTokenCookie(ctx.request);
  if (!cookie) {
    throw badUserInputErr("Specify refresh token.");
  }
  if (!RefreshToken.is(cookie.value)) {
    await deleteRefreshTokenCookie(ctx.request);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const hashed = await RefreshToken.hash(cookie.value);

  const user = await ctx.queries.user.findByRefreshToken(hashed);
  if (!user) {
    await deleteRefreshTokenCookie(ctx.request);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const touched = await ctx.repos.userToken.touch(hashed, new Date());
  if (!touched) {
    throw internalServerError();
  }

  const token = await signedJwt(user);

  return {
    __typename: "TokenRefreshSuccess",
    token,
  };
};
