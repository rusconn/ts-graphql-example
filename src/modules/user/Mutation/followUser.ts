import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    followUser(id: ID!): FollowUserResult
  }

  union FollowUserResult = FollowUserSuccess | InvalidInputError | ResourceNotFoundError

  type FollowUserSuccess {
    follower: User!
    followee: User!
    alreadyFollowed: Boolean!
  }
`;

export const resolver: MutationResolvers["followUser"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseUserNodeId(args.id);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }
  if (authed.id === parsed) {
    return {
      __typename: "InvalidInputError",
      message: "can't follow yourself",
    };
  }

  const result = await context.db.transaction().execute(async (trx) => {
    const followee = await trx
      .selectFrom("User")
      .where("id", "=", parsed)
      .selectAll()
      .forUpdate()
      .executeTakeFirst();

    if (!followee) {
      return { type: "notFound" } as const;
    }

    const follow = await trx
      .insertInto("FollowerFollowee")
      .values({
        id: uuidv7.gen(),
        followerId: authed.id,
        followeeId: followee.id,
      })
      .onConflict((oc) => oc.doNothing())
      .returning("followeeId")
      .executeTakeFirst();

    return { type: "ok", followee, follow } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "FollowUserSuccess",
        follower: authed,
        followee: result.followee,
        alreadyFollowed: !result.follow,
      };
    default:
      throw new Error(result satisfies never);
  }
};
