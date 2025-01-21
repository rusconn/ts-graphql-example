import type { Follow } from "../../models/follow.ts";
import type { User } from "../../models/user.ts";
import type { MutationResolvers } from "../../schema.ts";
import { followCursor } from "../_adapters/follow/cursor.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userFollow(id: ID!): UserFollowResult @semanticNonNull
  }

  union UserFollowResult = UserFollowSuccess | ResourceNotFoundError

  type UserFollowSuccess {
    followee: User!
    followingEdge: FollowingEdge!
  }
`;

export const resolver: MutationResolvers["userFollow"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseUserId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }
  if (authed.id === id) {
    throw badUserInputErr("Can't follow oneself");
  }

  const result = await context.api.follow.create({
    followerId: authed.id,
    followeeId: id,
  });

  switch (result.type) {
    case "Success": {
      const followee = await context.api.user.getById(id);
      if (!followee) throw internalServerError();
      return userFollowSuccess(followee, result.follow);
    }
    case "FollowAlreadyExists": {
      const [followee, follow] = await Promise.all([
        context.api.user.getById(id),
        context.api.follow.get({ followerId: authed.id, followeeId: id }),
      ]);
      if (!followee || !follow) throw internalServerError();
      return userFollowSuccess(followee, follow);
    }
    case "FolloweeNotExists":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified user does not exist.",
      };
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const userFollowSuccess = (followee: User, follow: Follow) => {
  return {
    __typename: "UserFollowSuccess",
    followee,
    followingEdge: followingEdge(followee, follow),
  } as const;
};

const followingEdge = (followee: User, follow: Follow) => {
  const cursor = followCursor(follow);
  const followedAt = follow.createdAt;
  return { node: followee, cursor, followedAt };
};
