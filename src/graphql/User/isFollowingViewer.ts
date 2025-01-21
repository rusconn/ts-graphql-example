import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    isFollowingViewer: Boolean @semanticNonNull
  }
`;

export const resolver: UserResolvers["isFollowingViewer"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const follow = await context.api.follow.load({
    followerId: parent.id,
    followeeId: context.user.id,
  });

  return follow != null;
};
