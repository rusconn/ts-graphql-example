import { pickDefined } from "../../lib/object/pickDefined.ts";
import type { UserResolvers } from "../../schema.ts";
import * as avatar from "./avatar.ts";
import * as bio from "./bio.ts";
import * as blockers from "./blockers.ts";
import * as blockings from "./blockings.ts";
import * as createdAt from "./createdAt.ts";
import * as email from "./email.ts";
import * as followers from "./followers.ts";
import * as followings from "./followings.ts";
import * as handle from "./handle.ts";
import * as id from "./id.ts";
import * as isBlockingViewer from "./isBlockingViewer.ts";
import * as isFollowingViewer from "./isFollowingViewer.ts";
import * as likes from "./likes.ts";
import * as location from "./location.ts";
import * as name from "./name.ts";
import * as posts from "./posts.ts";
import * as updatedAt from "./updatedAt.ts";
import * as viewerIsBlocking from "./viewerIsBlocking.ts";
import * as viewerIsFollowing from "./viewerIsFollowing.ts";
import * as website from "./website.ts";

const typeDef = /* GraphQL */ `
  type User
`;

export const typeDefs = [
  typeDef,
  avatar.typeDef,
  bio.typeDef,
  blockers.typeDef,
  blockings.typeDef,
  createdAt.typeDef,
  email.typeDef,
  followers.typeDef,
  followings.typeDef,
  handle.typeDef,
  id.typeDef,
  isBlockingViewer.typeDef,
  isFollowingViewer.typeDef,
  likes.typeDef,
  location.typeDef,
  name.typeDef,
  posts.typeDef,
  updatedAt.typeDef,
  viewerIsBlocking.typeDef,
  viewerIsFollowing.typeDef,
  website.typeDef,
];

export const resolvers: UserResolvers = pickDefined({
  avatar: avatar.resolver,
  bio: bio.resolver,
  blockers: blockers.resolver,
  blockings: blockings.resolver,
  createdAt: createdAt.resolver,
  email: email.resolver,
  followers: followers.resolver,
  followings: followings.resolver,
  handle: handle.resolver,
  id: id.resolver,
  isBlockingViewer: isBlockingViewer.resolver,
  isFollowingViewer: isFollowingViewer.resolver,
  likes: likes.resolver,
  location: location.resolver,
  name: name.resolver,
  posts: posts.resolver,
  updatedAt: updatedAt.resolver,
  viewerIsBlocking: viewerIsBlocking.resolver,
  viewerIsFollowing: viewerIsFollowing.resolver,
  website: website.resolver,
});
