import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { userNodeId } from "../common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent, _args, context) => {
  auth(context, parent);

  return userNodeId(parent.id);
};
