import type { PostResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasLiked: Boolean
  }
`;

export const resolver: PostResolvers["hasLiked"] = async (parent, _args, context) => {
  const authed = authAuthenticated(context);

  const result = await context.db
    .selectFrom("LikerPost")
    .where("userId", "=", authed.id)
    .where("postId", "=", parent.id)
    .select("userId")
    .executeTakeFirst();

  return result != null;
};
