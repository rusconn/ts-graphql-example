import type { MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

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

  const user = await ctx.repos.user.findByDbId(authed.id);
  if (!user) {
    throw internalServerError();
  }

  const success = await ctx.repos.userToken.delete(user.id);
  if (!success) {
    throw internalServerError();
  }

  return {
    __typename: "LogoutSuccess",
    id: userId(authed.id),
  };
};
