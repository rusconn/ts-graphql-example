import type { MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    紐づくリソースは全て削除される
    """
    accountDelete: AccountDeleteResult @semanticNonNull @complexity(value: 5)
  }

  union AccountDeleteResult = AccountDeleteSuccess

  type AccountDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["accountDelete"] = async (_parent, _args, context) => {
  const authed = authAuthenticated(context);
  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const user = await context.repos.user.findByDbId(authed.id);
  if (!user) {
    throw internalServerError();
  }

  const success = await context.repos.user.delete(user.id);
  if (!success) {
    throw internalServerError();
  }

  return {
    __typename: "AccountDeleteSuccess",
    id: userId(authed.id),
  };
};
