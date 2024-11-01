import type { QueryResolvers } from "../../../schema.ts";
import * as node from "./node.ts";

export const typeDefs = [node.typeDef];

export const resolvers: QueryResolvers = {
  node: node.resolver,
};
