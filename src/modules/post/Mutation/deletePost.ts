import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { postNodeId } from "../common/adapter.ts";
import { parsePostNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deletePost(id: ID!): DeletePostResult
  }

  union DeletePostResult = DeletePostSuccess | ResourceNotFoundError

  type DeletePostSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deletePost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parsePostNodeId(args.id);

  const post = await context.db
    .deleteFrom("Post")
    .where("id", "=", id)
    .where("userId", "=", authed.id)
    .returning("id")
    .executeTakeFirst();

  return post
    ? {
        __typename: "DeletePostSuccess",
        id: postNodeId(post.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
