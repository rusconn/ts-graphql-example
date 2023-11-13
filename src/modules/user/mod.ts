import type { Resolvers } from "../common/schema.js";
import * as Mutation from "./Mutation.js";
import * as Query from "./Query.js";
import * as User from "./User.js";

export const typeDefs = [Mutation.typeDefs, Query.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
};
