import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    viewerIsFollowing: Boolean
  }
`;

export const resolver: UserResolvers["viewerIsFollowing"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const follow = await context.api.user.loadFollow({
    followerId: context.user.id,
    followeeId: parent.id,
  });

  return follow != null;
};
