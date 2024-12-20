import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";

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

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

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
