import { ORIGIN } from "../../../config.ts";
import type { PostResolvers } from "../../../schema.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    url: URL
  }
`;

export const resolver: PostResolvers["url"] = async (parent, _args, context) => {
  const user = await context.api.user.getById(parent.userId);

  if (!user) {
    throw internalServerError();
  }

  return `${ORIGIN}/${user.name}/posts/${parent.id}`;
};
