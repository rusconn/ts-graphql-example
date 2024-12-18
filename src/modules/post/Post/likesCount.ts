import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    likesCount: Int
  }
`;

export const resolver: PostResolvers["likesCount"] = async (parent, _args, context) => {
  return await context.db
    .selectFrom("LikerPost")
    .where("postId", "=", parent.id)
    .select(({ fn }) => fn.count("postId").as("count"))
    .executeTakeFirstOrThrow()
    .then(({ count }) => Number(count));
};
