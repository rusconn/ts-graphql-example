import type { Resolvers } from "../common/schema.js";
import * as Node from "./Node.js";
import * as Query from "./Query.js";

export const typeDefs = [Node.typeDefs, Query.typeDefs];

export const resolvers: Resolvers = {
  Node: Node.resolvers,
  Query: Query.resolvers,
};
