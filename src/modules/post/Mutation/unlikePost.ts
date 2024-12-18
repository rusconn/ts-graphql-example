import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { postNodeId } from "../common/adapter.ts";
import { parsePostNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unlikePost(id: ID!): UnlikePostResult
  }

  union UnlikePostResult = UnlikePostSuccess | ResourceNotFoundError

  type UnlikePostSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["unlikePost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parsePostNodeId(args.id);

  const post = await context.db
    .deleteFrom("LikerPost")
    .where("userId", "=", authed.id)
    .where("postId", "=", id)
    .returning("postId")
    .executeTakeFirst();

  return post
    ? {
        __typename: "UnlikePostSuccess",
        id: postNodeId(post.postId),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
