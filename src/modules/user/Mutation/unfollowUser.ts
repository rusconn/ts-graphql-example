import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import { userNodeId } from "../common/adapter.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unfollowUser(id: ID!): UnfollowUserResult
  }

  union UnfollowUserResult = UnfollowUserSuccess | ResourceNotFoundError

  type UnfollowUserSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["unfollowUser"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parseUserNodeId(args.id);

  if (authed.id === id) {
    throw parseErr("can't unfollow yourself");
  }

  const result = await context.db
    .deleteFrom("FollowerFollowee")
    .where("followerId", "=", authed.id)
    .where("followeeId", "=", id)
    .returning("followeeId")
    .executeTakeFirst();

  if (!result) {
    return {
      __typename: "ResourceNotFoundError",
      message: "user not found",
    };
  }

  return {
    __typename: "UnfollowUserSuccess",
    id: userNodeId(result.followeeId),
  };
};
