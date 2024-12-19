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

  return await context.db
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
    .execute()
    .then((result) => result.slice(0, -1));
};
