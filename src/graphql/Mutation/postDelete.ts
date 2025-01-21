import type { MutationResolvers } from "../../schema.ts";
import { postId } from "../_adapters/post/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postDelete(id: ID!): PostDeleteResult @semanticNonNull
  }

  union PostDeleteResult = PostDeleteSuccess | ResourceNotFoundError

  type PostDeleteSuccess {
    postId: ID!
  }
`;

export const resolver: MutationResolvers["postDelete"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parsePostId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const deleted = await context.api.post.delete({
    id,
    authorId: authed.id,
  });

  return deleted
    ? {
        __typename: "PostDeleteSuccess",
        postId: postId(deleted.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified post does not exist.",
      };
};
