import type { QueryResolvers } from "../../../schema.ts";
import * as user from "./user.ts";
import * as viewer from "./viewer.ts";

export const typeDefs = [user.typeDef, viewer.typeDef];

export const resolvers: QueryResolvers = {
  user: user.resolver,
  viewer: viewer.resolver,
};
