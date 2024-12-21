import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    isBlockingViewer: Boolean
  }
`;

export const resolver: UserResolvers["isBlockingViewer"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const block = await context.db
    .selectFrom("BlockerBlockee")
    .where("blockerId", "=", parent.id)
    .where("blockeeId", "=", context.user.id)
    .select("blockerId")
    .executeTakeFirst();

  return block != null;
};
