import type { MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const success = await context.api.user.deleteTokenById(authed.id);

  if (!success) {
    throw internalServerError();
  }

  return {
    __typename: "LogoutSuccess",
    id: userId(authed.id),
  };
};
