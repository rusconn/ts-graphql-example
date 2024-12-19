import type { PostResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

// connection にする必要はあるか？
export const typeDef = /* GraphQL */ `
  extend type Post {
    parents: [Post]
  }
`;

export const resolver: PostResolvers["parents"] = async (parent, _args, context) => {
  auth(context);

  const columns = ["id", "updatedAt", "content", "userId", "parentId"] as const;

  return await context.db
    .withRecursive("replies", (db) =>
      db
        .selectFrom("Post")
        .where("id", "=", parent.id)
        .select(columns)
        .unionAll(
          db //
            .selectFrom("Post")
            .innerJoin("replies", "Post.id", "replies.parentId")
            .select(columns),
        ),
    )
    .selectFrom("replies")
    .selectAll()
    .orderBy("id", "asc")
    .execute()
    .then((result) => result.slice(0, -1));
};
