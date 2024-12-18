import type { QueryResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parsePostId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    post(id: ID!): Post
  }
`;

export const resolver: QueryResolvers["post"] = async (_parent, args, context) => {
  const parsed = parsePostId(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const post = await context.api.post.getById(parsed);

  return post ?? null;
};
