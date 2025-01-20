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
    accountDelete: AccountDeleteResult
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

  const deleted = await context.api.user.delete(authed.id);

  if (!deleted) {
    throw internalServerError();
  }

  return {
    __typename: "AccountDeleteSuccess",
    id: userId(deleted.id),
  };
};
