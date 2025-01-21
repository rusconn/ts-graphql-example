import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userFollow(id: ID!): UserFollowResult
  }

  union UserFollowResult = UserFollowSuccess | InvalidInputError | ResourceNotFoundError

  type UserFollowSuccess {
    follower: User!
    followee: User!
    alreadyFollowed: Boolean!
  }
`;

export const resolver: MutationResolvers["userFollow"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseUserId(args);

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
    const followee = await context.api.user.getById(parsed, trx);

    if (!followee) {
      return { type: "notFound" } as const;
    }

    const follow = await context.api.follow.create(
      { followerId: authed.id, followeeId: followee.id },
      trx,
    );

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
        __typename: "UserFollowSuccess",
        follower: authed,
        followee: result.followee,
        alreadyFollowed: !result.follow,
      };
    default:
      throw new Error(result satisfies never);
  }
};
