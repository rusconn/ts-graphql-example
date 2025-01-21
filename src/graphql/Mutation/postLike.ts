import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postLike(id: ID!): PostLikeResult
  }

  union PostLikeResult = PostLikeSuccess | ResourceNotFoundError

  type PostLikeSuccess {
    liker: User!
    alreadyLiked: Boolean!
  }
`;

export const resolver: MutationResolvers["postLike"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parsePostId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const result = await context.api.like.create({
    userId: authed.id,
    postId: id,
  });

  switch (result.type) {
    case "Success":
      return {
        __typename: "PostLikeSuccess",
        liker: authed,
        alreadyLiked: false,
      };
    case "LikeAlreadyExists":
      return {
        __typename: "PostLikeSuccess",
        liker: authed,
        alreadyLiked: true,
      };
    case "PostNotExists":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified post does not exist.",
      };
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};
