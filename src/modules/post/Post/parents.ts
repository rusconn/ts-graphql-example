import type { Post } from "../../../db/models/post.ts";
import type { PostResolvers } from "../../../schema.ts";

// connection にする必要はあるか？
export const typeDef = /* GraphQL */ `
  extend type Post {
    parents: [Post]
  }
`;

export const resolver: PostResolvers["parents"] = async (parent, _args, context) => {
  const parentsInclusive = await context.db
    .withRecursive("replies", (db) =>
      db
        .selectFrom("Post")
        .where("id", "=", parent.id)
        .selectAll()
        .unionAll(
          db //
            .selectFrom("Post")
            .innerJoin("replies", "Post.id", "replies.parentId")
            .selectAll("Post"),
        ),
    )
    .selectFrom("replies")
    .selectAll()
    .orderBy("id", "asc")
    .execute();

  return parentsInclusive.slice(0, -1) as Post[];
};
