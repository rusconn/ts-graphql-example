import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postUnlike(id: ID!): PostUnlikeResult
  }

  union PostUnlikeResult = PostUnlikeSuccess

  type PostUnlikeSuccess {
    unliker: User!
    alreadyUnliked: Boolean!
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

  const like = await context.api.like.delete({
    userId: authed.id,
    postId: id,
  });

  return {
    __typename: "PostUnlikeSuccess",
    unliker: authed,
    alreadyUnliked: !like,
  };
};
