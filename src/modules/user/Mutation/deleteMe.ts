import { authAuthenticated } from "../../common/authorizers.ts";
import type { MutationResolvers } from "../../common/schema.ts";
import { userNodeId } from "../common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "紐づくリソースは全て削除される"
    deleteMe: DeleteMeResult
  }

  union DeleteMeResult = DeleteMeSuccess

  type DeleteMeSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deleteMe"] = async (_parent, _args, context) => {
  const authed = authAuthenticated(context);

  const deleted = await context.db
    .deleteFrom("User")
    .where("id", "=", authed.id)
    .returning("id")
    .executeTakeFirstOrThrow();

  return {
    __typename: "DeleteMeSuccess",
    id: userNodeId(deleted.id),
  };
};
