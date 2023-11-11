import type { NodeResolvers } from "../common/schema";
import * as __resolveType from "./Node.__resolveType";

const typeDef = /* GraphQL */ `
  interface Node {
    id: ID!
  }
`;

export const typeDefs = [typeDef];

export const resolvers: NodeResolvers = {
  __resolveType: __resolveType.resolver,
};
