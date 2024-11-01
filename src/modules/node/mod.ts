import type { Resolvers } from "../../schema.ts";
import * as Node from "./Node/_mod.ts";
import * as Query from "./Query/_mod.ts";

export const typeDefs = [Node.typeDefs, Query.typeDefs];

export const resolvers: Resolvers = {
  Node: Node.resolvers,
  Query: Query.resolvers,
};
