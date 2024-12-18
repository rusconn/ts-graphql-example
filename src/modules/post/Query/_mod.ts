import * as post from "./post.ts";
import * as posts from "./posts.ts";

export const typeDefs = [post.typeDef, posts.typeDef];

export const resolvers = {
  post: post.resolver,
  posts: posts.resolver,
};
