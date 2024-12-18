import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    isFollowingViewer: Boolean
  }
`;

export const resolver: UserResolvers["isFollowingViewer"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const follow = await context.api.user.loadFollow({
    followerId: parent.id,
    followeeId: context.user.id,
  });

  return follow != null;
};
