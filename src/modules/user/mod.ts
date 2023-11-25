import type { Resolvers } from "../common/schema.ts";
import * as Mutation from "./Mutation/_mod.ts";
import * as Query from "./Query/_mod.ts";
import * as User from "./User/_mod.ts";

export const typeDefs = [Mutation.typeDefs, Query.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
};
