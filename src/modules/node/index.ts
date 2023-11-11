import type { Resolvers } from "../common/schema";
import * as Node from "./Node";
import * as Query from "./Query";

export const typeDefs = [Node.typeDefs, Query.typeDefs];

export const resolvers: Resolvers = {
  Node: Node.resolvers,
  Query: Query.resolvers,
};
