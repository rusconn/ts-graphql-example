import type { Like } from "../../models/like.ts";
import type { Post } from "../../models/post.ts";
import type { MutationResolvers } from "../../schema.ts";
import { likeCursor } from "../_adapters/like/cursor.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postLike(id: ID!): PostLikeResult @semanticNonNull
  }

  union PostLikeResult = PostLikeSuccess | ResourceNotFoundError

  type PostLikeSuccess {
    post: Post!
    likeEdge: LikeEdge!
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
    case "Success": {
      const post = await context.api.post.getById(id);
      if (!post) throw internalServerError();
      return postLikeSuccess(post, result.like);
    }
    case "LikeAlreadyExists": {
      const [post, like] = await Promise.all([
        context.api.post.getById(id),
        context.api.like.get({ userId: authed.id, postId: id }),
      ]);
      if (!post || !like) throw internalServerError();
      return postLikeSuccess(post, like);
    }
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

const postLikeSuccess = (post: Post, like: Like) => {
  return {
    __typename: "PostLikeSuccess",
    post,
    likeEdge: likeEdge(post, like),
  } as const;
};

const likeEdge = (post: Post, like: Like) => {
  const cursor = likeCursor(like);
  const likedAt = like.createdAt;
  return { node: post, cursor, likedAt };
};
