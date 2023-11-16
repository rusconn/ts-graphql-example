import type { Resolvers } from "../common/schema.ts";
import * as Node from "./Node.ts";
import * as Query from "./Query.ts";

export const typeDefs = [Node.typeDefs, Query.typeDefs];

export const resolvers: Resolvers = {
  Node: Node.resolvers,
  Query: Query.resolvers,
};
