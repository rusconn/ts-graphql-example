import type { QueryResolvers } from "../../../schema.ts";
import * as user from "./user.ts";
import * as users from "./users.ts";
import * as viewer from "./viewer.ts";

export const typeDefs = [user.typeDef, users.typeDef, viewer.typeDef];

export const resolvers: QueryResolvers = {
  user: user.resolver,
  users: users.resolver,
  viewer: viewer.resolver,
};
