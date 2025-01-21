import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userUnfollow(id: ID!): UserUnfollowResult
  }

  union UserUnfollowResult = UserUnfollowSuccess

  type UserUnfollowSuccess {
    unfollower: User!
    alreadyUnfollowed: Boolean!
  }
`;

export const resolver: MutationResolvers["userUnfollow"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseUserId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }
  if (authed.id === id) {
    throw badUserInputErr("Can't unfollow oneself");
  }

  const follow = await context.api.follow.delete({
    followerId: authed.id,
    followeeId: id,
  });

  return {
    __typename: "UserUnfollowSuccess",
    unfollower: authed,
    alreadyUnfollowed: !follow,
  };
};
