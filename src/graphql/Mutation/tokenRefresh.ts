import { RefreshToken } from "../../domain/entities.ts";
import { signedJwt } from "../../util/access-token.ts";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "../../util/refresh-token.ts";
import { badUserInputErr } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
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
  const cookie = await getRefreshTokenCookie(context);
  if (!cookie) {
    throw badUserInputErr("Specify refresh token.");
  }
  if (!RefreshToken.Token.is(cookie.value)) {
    await deleteRefreshTokenCookie(context);
    return {
      __typename: "InvalidRefreshTokenError",
      message: "The refresh token is invalid.",
    };
  }

  const hashed = await RefreshToken.Token.hash(cookie.value);
  const user = await context.queries.user.findByRefreshToken(hashed);
  if (!user) {
    await deleteRefreshTokenCookie(context);
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
