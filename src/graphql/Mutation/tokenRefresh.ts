import { RefreshToken } from "../../domain/models.ts";
import { signedJwt } from "../../util/accessToken.ts";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "../../util/refreshToken.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import type { MutationResolvers } from "../_schema.ts";

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
  if (!RefreshToken.Token.is(cookie.value)) {
    await deleteRefreshTokenCookie(context.request);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);

  const user = await context.queries.user.findByRefreshToken(hashed);
  if (!user) {
    await deleteRefreshTokenCookie(context.request);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  try {
    await context.unitOfWork.run(async (repos) => {
      await repos.refreshToken.touch(hashed, new Date());
    });
  } catch (e) {
    throw internalServerError(e);
  }

  return {
    __typename: "TokenRefreshSuccess",
    token: await signedJwt(user),
  };
};
