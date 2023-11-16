import type { QueryResolvers } from "../common/schema.ts";
import * as me from "./Query.me.ts";
import * as user from "./Query.user.ts";
import * as users from "./Query.users.ts";

export const typeDefs = [me.typeDef, user.typeDef, users.typeDef];

export const resolvers: QueryResolvers = {
  me: me.resolver,
  user: user.resolver,
  users: users.resolver,
};
