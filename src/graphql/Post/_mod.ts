import { pickDefined } from "../../lib/object/pickDefined.ts";
import type { PostResolvers } from "../../schema.ts";
import * as author from "./author.ts";
import * as content from "./content.ts";
import * as createdAt from "./createdAt.ts";
import * as hasDeleted from "./hasDeleted.ts";
import * as hasUpdated from "./hasUpdated.ts";
import * as id from "./id.ts";
import * as likeCount from "./likeCount.ts";
import * as likers from "./likers.ts";
import * as parents from "./parents.ts";
import * as replies from "./replies.ts";
import * as replyCount from "./replyCount.ts";
import * as updatedAt from "./updatedAt.ts";
import * as url from "./url.ts";
import * as viewerHasLiked from "./viewerHasLiked.ts";

const typeDef = /* GraphQL */ `
  type Post
`;

export const typeDefs = [
  typeDef,
  author.typeDef,
  content.typeDef,
  createdAt.typeDef,
  hasDeleted.typeDef,
  hasUpdated.typeDef,
  id.typeDef,
  likeCount.typeDef,
  likers.typeDef,
  parents.typeDef,
  replies.typeDef,
  replyCount.typeDef,
  updatedAt.typeDef,
  url.typeDef,
  viewerHasLiked.typeDef,
];

export const resolvers: PostResolvers = pickDefined({
  author: author.resolver,
  content: content.resolver,
  createdAt: createdAt.resolver,
  hasDeleted: hasDeleted.resolver,
  hasUpdated: hasUpdated.resolver,
  id: id.resolver,
  likeCount: likeCount.resolver,
  likers: likers.resolver,
  parents: parents.resolver,
  replies: replies.resolver,
  replyCount: replyCount.resolver,
  updatedAt: updatedAt.resolver,
  url: url.resolver,
  viewerHasLiked: viewerHasLiked.resolver,
});
