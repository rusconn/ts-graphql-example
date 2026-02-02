import { RefreshToken } from "../../domain/user-token.ts";
import type { MutationResolvers } from "../../schema.ts";
import { getRefreshTokenCookie } from "../../util/refreshToken.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult @semanticNonNull @complexity(value: 5)
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, ctx) => {
  const authed = authAuthenticated(ctx);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  const cookie = await getRefreshTokenCookie(ctx.request);
  if (!cookie || !RefreshToken.is(cookie.value)) {
    return {
      __typename: "LogoutSuccess",
      id: userId(authed.id),
    };
  }

  const hashed = await RefreshToken.hash(cookie.value);
  const _success = await ctx.repos.userToken.delete(hashed);

  return {
    __typename: "LogoutSuccess",
    id: userId(authed.id),
  };
};
