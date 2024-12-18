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

  const result = await context.db
    .selectFrom("FollowerFollowee")
    .where("followerId", "=", parent.id)
    .where("followeeId", "=", context.user.id)
    .select("followerId")
    .executeTakeFirst();

  return result != null;
};
