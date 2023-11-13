import type { QueryResolvers } from "../common/schema.js";
import * as node from "./Query.node.js";

export const typeDefs = [node.typeDef];

export const resolvers: QueryResolvers = {
  node: node.resolver,
};
