import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import { userNodeId } from "../common/adapter.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    followUser(id: ID!): FollowUserResult
  }

  union FollowUserResult = FollowUserSuccess | ResourceNotFoundError

  type FollowUserSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["followUser"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parseUserNodeId(args.id);

  if (authed.id === id) {
    throw parseErr("can't follow yourself");
  }

  const followee = await context.db
    .selectFrom("User")
    .where("id", "=", id)
    .select("id")
    .executeTakeFirst();

  if (!followee) {
    return {
      __typename: "ResourceNotFoundError",
      message: "user not found",
    };
  }

  const result = await context.db
    .insertInto("FollowerFollowee")
    .values({
      followerId: authed.id,
      followeeId: id,
    })
    .onConflict((oc) => oc.doNothing())
    .returning("followeeId")
    .executeTakeFirstOrThrow();

  return {
    __typename: "FollowUserSuccess",
    id: userNodeId(result.followeeId),
  };
};
