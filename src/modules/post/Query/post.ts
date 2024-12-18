import type { QueryResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/resolvers.ts";
import { parsePostNodeId } from "../common/parser.ts";
import { getPost } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    post(id: ID!): Post
  }
`;

export const resolver: QueryResolvers["post"] = async (_parent, args, context) => {
  const parsed = parsePostNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const post = await getPost(context, { id: parsed });

  return post ?? null;
};
