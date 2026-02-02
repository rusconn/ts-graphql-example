import { RefreshToken } from "../../domain/user-token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { getRefreshTokenCookie } from "../../util/refreshToken.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult @semanticNonNull @complexity(value: 5)
  }

  type LogoutResult {
    success: Boolean!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, ctx) => {
  if (ctx.user == null) {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  const cookie = await getRefreshTokenCookie(ctx.request);
  if (!cookie || !RefreshToken.is(cookie.value)) {
    return {
      __typename: "LogoutResult",
      success: true,
    };
  }

  const hashed = await RefreshToken.hash(cookie.value);
  const _success = await ctx.repos.userToken.delete(hashed);

  return {
    __typename: "LogoutResult",
    success: true,
  };
};
