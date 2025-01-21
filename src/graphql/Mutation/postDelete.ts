import type { MutationResolvers } from "../../schema.ts";
import { postId } from "../_adapters/post/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postDelete(id: ID!): PostDeleteResult
  }

  union PostDeleteResult = PostDeleteSuccess | InvalidInputError | ResourceNotFoundError

  type PostDeleteSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["postDelete"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parsePostId(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const deleted = await context.api.post.delete({
    id: parsed,
    userId: authed.id,
  });

  return deleted
    ? {
        __typename: "PostDeleteSuccess",
        id: postId(deleted.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
