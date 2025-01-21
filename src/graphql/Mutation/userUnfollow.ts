import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userUnfollow(id: ID!): UserUnfollowResult
  }

  union UserUnfollowResult = UserUnfollowSuccess | InvalidInputError | ResourceNotFoundError

  type UserUnfollowSuccess {
    unfollower: User!
    unfollowee: User!
    alreadyUnfollowed: Boolean!
  }
`;

export const resolver: MutationResolvers["userUnfollow"] = async (_parent, args, context) => {
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
      message: "can't unfollow yourself",
    };
  }

  const result = await context.db.transaction().execute(async (trx) => {
    const unfollowee = await context.api.user.getById(parsed, trx);

    if (!unfollowee) {
      return { type: "notFound" } as const;
    }

    const follow = await context.api.follow.delete(
      { followerId: authed.id, followeeId: unfollowee.id },
      trx,
    );

    return { type: "ok", unfollowee, follow } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "UserUnfollowSuccess",
        unfollower: authed,
        unfollowee: result.unfollowee,
        alreadyUnfollowed: !result.follow,
      };
    default:
      throw new Error(result satisfies never);
  }
};
