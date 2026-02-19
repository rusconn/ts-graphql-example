import type { QueryResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    viewer: User
  }
`;

export const resolver: QueryResolvers["viewer"] = (_parent, _args, context) => {
  return context.user;
};
