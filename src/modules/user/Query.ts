import type { QueryResolvers } from "../common/schema";
import * as me from "./Query.me";
import * as user from "./Query.user";
import * as users from "./Query.users";

export const typeDefs = [me.typeDef, user.typeDef, users.typeDef];

export const resolvers: QueryResolvers = {
  me: me.resolver,
  user: user.resolver,
  users: users.resolver,
};
