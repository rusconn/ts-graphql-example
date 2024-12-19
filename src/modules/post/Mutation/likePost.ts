import { v7 as uuidv7 } from "uuid";

import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { postNodeId } from "../common/adapter.ts";
import { parsePostNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    likePost(id: ID!): LikePostResult
  }

  union LikePostResult = LikePostSuccess | ResourceNotFoundError

  type LikePostSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["likePost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parsePostNodeId(args.id);

  const post = await context.db
    .insertInto("LikerPost")
    .values({
      id: uuidv7(),
      userId: authed.id,
      postId: id,
    })
    .returning("postId")
    .executeTakeFirst();

  return post
    ? {
        __typename: "LikePostSuccess",
        id: postNodeId(post.postId),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
