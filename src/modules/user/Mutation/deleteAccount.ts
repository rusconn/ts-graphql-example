import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";
import { userId } from "../adapters/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    紐づくリソースは全て削除される
    """
    deleteAccount: DeleteAccountResult
  }

  union DeleteAccountResult = DeleteAccountSuccess

  type DeleteAccountSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteAccount"] = async (_parent, _args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const deleted = await context.api.user.delete(authed.id);

  if (!deleted) {
    throw internalServerError();
  }

  return {
    __typename: "DeleteAccountSuccess",
    id: userId(deleted.id),
  };
};
