import type { PostResolvers } from "../../schema.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    author: User @semanticNonNull
  }
`;

export const resolver: PostResolvers["author"] = async (parent, _args, context) => {
  const user = await context.api.user.load(parent.authorId);

  if (!user) {
    throw internalServerError();
  }

  return user;
};
