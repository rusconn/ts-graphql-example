import type { QueryResolvers } from "../../../schema.ts";
import * as me from "./me.ts";
import * as user from "./user.ts";

export const typeDefs = [me.typeDef, user.typeDef];

export const resolvers: QueryResolvers = {
  me: me.resolver,
  user: user.resolver,
};
