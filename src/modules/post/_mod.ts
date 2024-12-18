import type { Resolvers } from "../../schema.ts";
import * as Mutation from "./Mutation/_mod.ts";
import * as Post from "./Post/_mod.ts";
import * as Query from "./Query/_mod.ts";
import * as User from "./User/_mod.ts";

export const typeDefs = [Mutation.typeDefs, Post.typeDefs, Query.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Post: Post.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
};
