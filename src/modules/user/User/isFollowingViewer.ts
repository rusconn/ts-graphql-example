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

  const follow = await context.db
    .selectFrom("Follow")
    .where("followerId", "=", parent.id)
    .where("followeeId", "=", context.user.id)
    .select("followerId")
    .executeTakeFirst();

  return follow != null;
};
