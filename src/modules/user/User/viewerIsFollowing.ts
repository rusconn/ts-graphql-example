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

  const follow = await context.db
    .selectFrom("Follow")
    .where("followerId", "=", context.user.id)
    .where("followeeId", "=", parent.id)
    .select("followerId")
    .executeTakeFirst();

  return follow != null;
};
