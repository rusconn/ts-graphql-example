import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
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

  const deleted = await context.db
    .deleteFrom("User")
    .where("id", "=", authed.id)
    .returning("id")
    .executeTakeFirstOrThrow();

  return {
    __typename: "DeleteAccountSuccess",
    id: userId(deleted.id),
  };
};
