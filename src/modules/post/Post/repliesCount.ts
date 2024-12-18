import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    repliesCount: Int
  }
`;

export const resolver: PostResolvers["repliesCount"] = async (parent, _args, context) => {
  return await context.db
    .selectFrom("Post")
    .where("parentId", "=", parent.id)
    .select(({ fn }) => fn.count("parentId").as("count"))
    .executeTakeFirstOrThrow()
    .then(({ count }) => Number(count));
};
