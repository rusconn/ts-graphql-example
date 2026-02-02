import type { QueryResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    viewer: User
  }
`;

export const resolver: QueryResolvers["viewer"] = (_parent, _args, ctx) => {
  return ctx.user;
};
