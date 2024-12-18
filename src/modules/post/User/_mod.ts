import type { UserResolvers } from "../../../schema.ts";
import * as likes from "./likes.ts";
import * as posts from "./posts.ts";

export const typeDefs = [likes.typeDef, posts.typeDef];

export const resolvers: UserResolvers = {
  likes: likes.resolver,
  posts: posts.resolver,
};
