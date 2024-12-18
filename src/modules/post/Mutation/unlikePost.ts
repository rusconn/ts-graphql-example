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
    const post = await trx
      .selectFrom("Post")
      .where("id", "=", parsed)
      .selectAll()
      .forUpdate()
      .executeTakeFirst();

    if (!post) {
      return { type: "notFound" } as const;
    }

    const unlike = await context.db
      .deleteFrom("Like")
      .where("userId", "=", authed.id)
      .where("postId", "=", post.id)
      .returning("postId")
      .executeTakeFirst();

    return { type: "ok", unliked: post, unlike } as const;
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
        alreadyUnliked: !result.unlike,
      };
    default:
      throw new Error(result satisfies never);
  }
};
