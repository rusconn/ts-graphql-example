import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { postId } from "../adapters/id.ts";
import { parsePostId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    deletePost(id: ID!): DeletePostResult
  }

  union DeletePostResult = DeletePostSuccess | InvalidInputError | ResourceNotFoundError

  type DeletePostSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["deletePost"] = async (_parent, args, context) => {
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

  const deleted = await context.db
    .deleteFrom("Post")
    .where("id", "=", parsed)
    .where("userId", "=", authed.id)
    .returning("id")
    .executeTakeFirst();

  return deleted
    ? {
        __typename: "DeletePostSuccess",
        id: postId(deleted.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
