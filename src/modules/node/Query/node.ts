import type { QueryResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseId } from "../../common/parsers/id.ts";
import * as postId from "../../post/internal/id.ts";
import { getPost } from "../../post/resolvers.ts";
import * as userId from "../../user/internal/id.ts";
import { getUser } from "../../user/resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const parsed = parseId(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { type, internalId } = parsed;

  const [getNode, isInternalId] = (
    {
      Post: [getPost, postId.is],
      User: [getUser, userId.is],
    } as const
  )[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`invalid node id: ${args.id}`);
  }

  const node = await getNode(context, { id: internalId });

  return node == null ? null : { type, ...node };
};
