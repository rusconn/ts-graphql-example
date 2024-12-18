import type { PostResolvers } from "../../../schema.ts";
import { internalServerError } from "../../common/errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    user: User
  }
`;

export const resolver: PostResolvers["user"] = async (parent, _args, context) => {
  const user = await context.api.user.getById(parent.userId);

  if (!user) {
    throw internalServerError();
  }

  return user;
};
