import type { Resolvers } from "../../schema.ts";
import * as node from "./node.ts";
import * as post from "./post.ts";
import * as posts from "./posts.ts";
import * as user from "./user.ts";
import * as viewer from "./viewer.ts";

const typeDef = /* GraphQL */ `
  type Query
`;

export const typeDefs = [
  typeDef,
  node.typeDef,
  post.typeDef,
  posts.typeDef,
  user.typeDef,
  viewer.typeDef,
];

export const resolvers: Resolvers["Query"] = {
  node: node.resolver,
  post: post.resolver,
  posts: posts.resolver,
  user: user.resolver,
  viewer: viewer.resolver,
};
