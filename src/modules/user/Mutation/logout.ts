import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: LogoutResult
  }

  union LogoutResult = LogoutSuccess

  type LogoutSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, context) => {
  const authed = authAuthenticated(context);

  const updated = await context.db
    .updateTable("User")
    .where("id", "=", authed.id)
    .set({
      updatedAt: new Date(),
      token: null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "LogoutSuccess",
    user: updated,
  };
};
