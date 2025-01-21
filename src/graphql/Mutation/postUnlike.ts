import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postUnlike(id: ID!): PostUnlikeResult
  }

  union PostUnlikeResult = PostUnlikeSuccess | InvalidInputError | ResourceNotFoundError

  type PostUnlikeSuccess {
    post: Post!
    alreadyUnliked: Boolean!
  }
`;

export const resolver: MutationResolvers["postUnlike"] = async (_parent, args, context) => {
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

  const result = await context.db.transaction().execute(async (trx) => {
    const post = await context.api.post.getById(parsed, trx);

    if (!post) {
      return { type: "notFound" } as const;
    }

    const like = await context.api.like.delete(
      { userId: authed.id, postId: post.id }, //
      trx,
    );

    return { type: "ok", unliked: post, like } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
    case "ok":
      return {
        __typename: "PostUnlikeSuccess",
        post: result.unliked,
        alreadyUnliked: !result.like,
      };
    default:
      throw new Error(result satisfies never);
  }
};
