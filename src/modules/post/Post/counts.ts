import type { PostResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

// TODO: 分解？
// codegenのmapperでPostにしてPostCounts.replies等でカウント？
export const typeDef = /* GraphQL */ `
  extend type Post {
    counts: PostCounts
  }

  type PostCounts {
    replies: Int
    likes: Int
  }
`;

export const resolver: PostResolvers["counts"] = async (parent, _args, context) => {
  auth(context);

  const [replies, likes] = await Promise.all([
    context.db
      .selectFrom("Post")
      .where("parentId", "=", parent.id)
      .select(({ fn }) => fn.count("parentId").as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => Number(count)),
    context.db
      .selectFrom("LikerPost")
      .where("postId", "=", parent.id)
      .select(({ fn }) => fn.count("postId").as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => Number(count)),
  ]);

  return { replies, likes };
};
