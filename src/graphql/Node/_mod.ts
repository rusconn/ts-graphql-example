import type { NodeResolvers } from "../../schema.ts";
import * as __resolveType from "./__resolveType.ts";

const typeDef = /* GraphQL */ `
  interface Node {
    id: ID!
  }
`;

export const typeDefs = [typeDef];

export const resolvers: NodeResolvers = {
  __resolveType: __resolveType.resolver,
};
