import type { Resolvers } from "../common/schema";
import * as Mutation from "./Mutation";
import * as Query from "./Query";
import * as User from "./User";

export const typeDefs = [Mutation.typeDefs, Query.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
};
