import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    viewerIsBlocking: Boolean
  }
`;

export const resolver: UserResolvers["viewerIsBlocking"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const block = await context.db
    .selectFrom("Block")
    .where("blockerId", "=", context.user.id)
    .where("blockeeId", "=", parent.id)
    .select("blockerId")
    .executeTakeFirst();

  return block != null;
};
