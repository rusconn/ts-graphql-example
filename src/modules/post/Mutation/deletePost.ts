import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { postNodeId } from "../common/adapter.ts";
import { parsePostNodeId } from "../common/parser.ts";

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

  const parsed = parsePostNodeId(args.id);

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
        id: postNodeId(deleted.id),
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};
