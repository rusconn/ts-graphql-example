import { baseUrl } from "../../config.ts";
import type { PostResolvers } from "../../schema.ts";
import type { URL } from "../URL.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    url: URL @semanticNonNull
  }
`;

export const resolver: PostResolvers["url"] = async (parent, _args, context) => {
  const user = await context.api.user.getById(parent.authorId);

  if (!user) {
    throw internalServerError();
  }

  return `${baseUrl}/${user.name}/posts/${parent.id}` as URL;
};
