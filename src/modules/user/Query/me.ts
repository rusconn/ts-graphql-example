import { auth } from "../../common/authorizers.ts";
import type { QueryResolvers } from "../../common/schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = auth(context);

  return authed;
};
