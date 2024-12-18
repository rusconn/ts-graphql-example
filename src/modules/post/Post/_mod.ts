import type { PostResolvers } from "../../../schema.ts";
import * as content from "./content.ts";
import * as counts from "./counts.ts";
import * as hasLiked from "./hasLiked.ts";
import * as id from "./id.ts";
import * as likers from "./likers.ts";
import * as parents from "./parents.ts";
import * as replies from "./replies.ts";
import * as url from "./url.ts";
import * as user from "./user.ts";

const typeDef = /* GraphQL */ `
  type Post
`;

export const typeDefs = [
  typeDef,
  content.typeDef,
  counts.typeDef,
  hasLiked.typeDef,
  id.typeDef,
  likers.typeDef,
  parents.typeDef,
  replies.typeDef,
  url.typeDef,
  user.typeDef,
];

export const resolvers: PostResolvers = {
  content: content.resolver,
  counts: counts.resolver,
  hasLiked: hasLiked.resolver,
  id: id.resolver,
  likers: likers.resolver,
  parents: parents.resolver,
  replies: replies.resolver,
  url: url.resolver,
  user: user.resolver,
};
