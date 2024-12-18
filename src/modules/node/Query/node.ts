import * as postId from "../../../db/models/post/id.ts";
import * as userId from "../../../db/models/user/id.ts";
import type { QueryResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseId } from "../../common/parsers/id.ts";
import * as post from "../../post/node.ts";
import * as user from "../../user/node.ts";

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

  const pairs = {
    Post: [postId.is, post.getNode],
    User: [userId.is, user.getNode],
  } as const;

  const [isInternalId, getNode] = pairs[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`invalid node id: ${args.id}`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(context, internalId);

  return node == null ? null : { type, ...node };
};
