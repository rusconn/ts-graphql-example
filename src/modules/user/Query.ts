import type { QueryResolvers } from "../common/schema.js";
import * as me from "./Query.me.js";
import * as user from "./Query.user.js";
import * as users from "./Query.users.js";

export const typeDefs = [me.typeDef, user.typeDef, users.typeDef];

export const resolvers: QueryResolvers = {
  me: me.resolver,
  user: user.resolver,
  users: users.resolver,
};
