import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parsePostId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    likePost(id: ID!): LikePostResult
  }

  union LikePostResult = LikePostSuccess | InvalidInputError | ResourceNotFoundError

  type LikePostSuccess {
    post: Post!
    alreadyLiked: Boolean!
  }
`;

export const resolver: MutationResolvers["likePost"] = async (_parent, args, context) => {
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

    const like = await context.api.user.createLike(
      { userId: authed.id, postId: post.id }, //
      trx,
    );

    return { type: "ok", liked: post, like } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
    case "ok":
      return {
        __typename: "LikePostSuccess",
        post: result.liked,
        alreadyLiked: !result.like,
      };
    default:
      throw new Error(result satisfies never);
  }
};
