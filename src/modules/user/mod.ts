import type { Resolvers } from "../common/schema.ts";
import * as Mutation from "./Mutation.ts";
import * as Query from "./Query.ts";
import * as User from "./User.ts";

export const typeDefs = [Mutation.typeDefs, Query.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
};
