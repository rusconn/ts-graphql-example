import type { UserResolvers } from "../../../schema.ts";
import * as likedPosts from "./likedPosts.ts";
import * as posts from "./posts.ts";

export const typeDefs = [likedPosts.typeDef, posts.typeDef];

export const resolvers: UserResolvers = {
  likedPosts: likedPosts.resolver,
  posts: posts.resolver,
};
