import type { QueryResolvers } from "../common/schema";
import * as node from "./Query.node";

export const typeDefs = [node.typeDef];

export const resolvers: QueryResolvers = {
  node: node.resolver,
};
