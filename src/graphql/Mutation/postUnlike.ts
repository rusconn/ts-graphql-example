import type { MutationResolvers } from "../../schema.ts";
import { postId } from "../_adapters/post/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postUnlike(id: ID!): PostUnlikeResult @semanticNonNull
  }

  union PostUnlikeResult = PostUnlikeSuccess

  type PostUnlikeSuccess {
    postId: ID!
  }
`;

export const resolver: MutationResolvers["postUnlike"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parsePostId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const _like = await context.api.like.delete({
    userId: authed.id,
    postId: id,
  });

  return {
    __typename: "PostUnlikeSuccess",
    postId: postId(id),
  };
};
