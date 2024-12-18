import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    avatar: URL
  }
`;

export const resolver: UserResolvers["avatar"] = (parent, _args, context) => {
  auth(context);

  return parent.avatar;
};
