import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userFollow(id: ID!): UserFollowResult
  }

  union UserFollowResult = UserFollowSuccess | ResourceNotFoundError

  type UserFollowSuccess {
    follower: User!
    alreadyFollowed: Boolean!
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
    case "Success":
      return {
        __typename: "UserFollowSuccess",
        follower: authed,
        alreadyFollowed: false,
      };
    case "FollowAlreadyExists": {
      return {
        __typename: "UserFollowSuccess",
        follower: authed,
        alreadyFollowed: true,
      };
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
