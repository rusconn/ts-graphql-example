import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unfollowUser(id: ID!): UnfollowUserResult
  }

  union UnfollowUserResult = UnfollowUserSuccess | InvalidInputError | ResourceNotFoundError

  type UnfollowUserSuccess {
    unfollower: User!
    unfollowee: User!
    alreadyUnfollowed: Boolean!
  }
`;

export const resolver: MutationResolvers["unfollowUser"] = async (_parent, args, context) => {
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
      message: "can't unfollow yourself",
    };
  }

  const result = await context.db.transaction().execute(async (trx) => {
    const unfollowee = await trx
      .selectFrom("User")
      .where("id", "=", parsed)
      .selectAll()
      .forUpdate()
      .executeTakeFirst();

    if (!unfollowee) {
      return { type: "notFound" } as const;
    }

    const unfollow = await trx
      .deleteFrom("FollowerFollowee")
      .where("followerId", "=", authed.id)
      .where("followeeId", "=", unfollowee.id)
      .returning("followeeId")
      .executeTakeFirst();

    return { type: "ok", unfollowee, unfollow } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "UnfollowUserSuccess",
        unfollower: authed,
        unfollowee: result.unfollowee,
        alreadyUnfollowed: !result.unfollow,
      };
    default:
      throw new Error(result satisfies never);
  }
};
