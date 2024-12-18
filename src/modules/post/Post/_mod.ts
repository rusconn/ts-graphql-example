import type { PostResolvers } from "../../../schema.ts";
import * as content from "./content.ts";
import * as createdAt from "./createdAt.ts";
import * as hasUpdated from "./hasUpdated.ts";
import * as id from "./id.ts";
import * as likers from "./likers.ts";
import * as likesCount from "./likesCount.ts";
import * as parents from "./parents.ts";
import * as replies from "./replies.ts";
import * as repliesCount from "./repliesCount.ts";
import * as updatedAt from "./updatedAt.ts";
import * as url from "./url.ts";
import * as user from "./user.ts";
import * as viewerHasLiked from "./viewerHasLiked.ts";

const typeDef = /* GraphQL */ `
  type Post
`;

export const typeDefs = [
  typeDef,
  content.typeDef,
  createdAt.typeDef,
  hasUpdated.typeDef,
  id.typeDef,
  likers.typeDef,
  likesCount.typeDef,
  parents.typeDef,
  replies.typeDef,
  repliesCount.typeDef,
  updatedAt.typeDef,
  url.typeDef,
  user.typeDef,
  viewerHasLiked.typeDef,
];

export const resolvers: PostResolvers = {
  content: content.resolver,
  createdAt: createdAt.resolver,
  hasUpdated: hasUpdated.resolver,
  id: id.resolver,
  likers: likers.resolver,
  likesCount: likesCount.resolver,
  parents: parents.resolver,
  replies: replies.resolver,
  repliesCount: repliesCount.resolver,
  updatedAt: updatedAt.resolver,
  url: url.resolver,
  user: user.resolver,
  viewerHasLiked: viewerHasLiked.resolver,
};
