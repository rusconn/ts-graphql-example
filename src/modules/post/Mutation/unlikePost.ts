import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parsePostId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unlikePost(id: ID!): UnlikePostResult
  }

  union UnlikePostResult = UnlikePostSuccess | InvalidInputError | ResourceNotFoundError

  type UnlikePostSuccess {
    post: Post!
    alreadyUnliked: Boolean!
  }
`;

export const resolver: MutationResolvers["unlikePost"] = async (_parent, args, context) => {
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

    const like = await context.api.user.deleteLike(
      {
        userId: authed.id,
        postId: post.id,
      },
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
        __typename: "UnlikePostSuccess",
        post: result.unliked,
        alreadyUnliked: !result.like,
      };
    default:
      throw new Error(result satisfies never);
  }
};
