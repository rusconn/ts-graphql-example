import * as PostId from "../../models/post/id.ts";
import * as UserId from "../../models/user/id.ts";
import type { QueryResolvers } from "../../schema.ts";
import * as Post from "../Post/_node.ts";
import * as User from "../User/_node.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseId } from "../_parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const id = parseId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const { type, internalId } = id;

  const pairs = {
    Post: [PostId.is, Post.getNode],
    User: [UserId.is, User.getNode],
  } as const;

  const [isInternalId, getNode] = pairs[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`Invalid global id '${args.id}'`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(context)(internalId);

  return node == null ? null : { type, ...node };
};
