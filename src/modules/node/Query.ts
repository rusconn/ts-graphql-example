import type { QueryResolvers } from "../common/schema.ts";
import * as node from "./Query.node.ts";

export const typeDefs = [node.typeDef];

export const resolvers: QueryResolvers = {
  node: node.resolver,
};
