import { isAuthenticated } from "../common/authorizers.js";
import { full } from "../common/resolvers.js";
import type { QueryResolvers } from "../common/schema.js";

export const typeDef = /* GraphQL */ `
  extend type Query {
    me: User
  }
`;

export const resolver: QueryResolvers["me"] = (_parent, _args, context) => {
  const authed = authorizer(context.user);

  return full(authed);
};

export const authorizer = isAuthenticated;
